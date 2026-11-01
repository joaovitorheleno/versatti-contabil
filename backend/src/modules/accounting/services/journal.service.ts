import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CurrentUser } from '../../../common/utils/client-access';
import { BankTransactionEntity } from '../../../entities/bank-transaction.entity';
import { ClientEntity } from '../../../entities/client.entity';
import { JournalEntryEntity } from '../../../entities/journal-entry.entity';
import { JournalLineEntity } from '../../../entities/journal-line.entity';
import {
  BankTransactionStatusEnum,
  JournalSourceEnum,
} from '../../../enum/accounting.enum';
import { CreateJournalEntryDto, ListEntriesQueryDto } from '../dto/accounting.dto';
import { centsToNumber, fromCents, toCents } from '../money';
import { ChartService, findClientOrFail } from './chart.service';
import { ClosingService } from './closing.service';

const MAX_RESULTS = 1000;

export interface EntryLineInput {
  accountId: string;
  debitCents: number;
  creditCents: number;
}

@Injectable()
export class JournalService {
  constructor(
    private readonly chartService: ChartService,
    private readonly closingService: ClosingService,
  ) {}

  public async list(clientId: string, query: ListEntriesQueryDto) {
    await findClientOrFail(clientId);

    const qb = JournalEntryEntity.createQueryBuilder('entry')
      .leftJoinAndSelect('entry.lines', 'line')
      .leftJoinAndSelect('line.account', 'account')
      .where('entry.client_id = :clientId', { clientId })
      .orderBy('entry.date', 'DESC')
      .addOrderBy('entry.createdAt', 'DESC')
      .take(MAX_RESULTS);

    if (query.from) qb.andWhere('entry.date >= :from', { from: query.from });
    if (query.to) qb.andWhere('entry.date <= :to', { to: query.to });
    if (query.accountId) {
      qb.andWhere(
        'entry.id IN (SELECT l.entry_id FROM journal_lines l WHERE l.account_id = :accountId)',
        { accountId: query.accountId },
      );
    }

    const [entries, lockedUntil] = await Promise.all([
      qb.getMany(),
      this.closingService.lockedUntil(clientId),
    ]);

    return {
      lockedUntil,
      entries: entries.map((entry) => this.serialize(entry, lockedUntil)),
    };
  }

  public async create(
    user: CurrentUser,
    clientId: string,
    dto: CreateJournalEntryDto,
  ) {
    const client = await findClientOrFail(clientId);
    const lines = dto.lines.map((line) => ({
      accountId: line.accountId,
      debitCents: toCents(line.debit),
      creditCents: toCents(line.credit),
    }));

    const entry = await JournalEntryEntity.getRepository().manager.transaction((manager) =>
      this.createEntry(manager, user, client, {
        date: dto.date.slice(0, 10),
        description: dto.description.trim(),
        source: JournalSourceEnum.MANUAL,
        lines,
      }),
    );

    return this.serialize(await this.findOrFail(clientId, entry.id), null);
  }

  public async createEntry(
    manager: EntityManager,
    user: CurrentUser,
    client: ClientEntity,
    input: {
      date: string;
      description: string;
      source: JournalSourceEnum;
      lines: EntryLineInput[];
    },
  ) {
    await this.closingService.assertOpen(client.id, input.date);

    input.lines.forEach((line) => {
      if (line.debitCents < 0 || line.creditCents < 0) {
        throw new BadRequestException('Valores não podem ser negativos');
      }
      if ((line.debitCents > 0) === (line.creditCents > 0)) {
        throw new BadRequestException('Cada linha deve ter valor apenas no débito ou apenas no crédito');
      }
    });

    const debit = input.lines.reduce((sum, l) => sum + l.debitCents, 0);
    const credit = input.lines.reduce((sum, l) => sum + l.creditCents, 0);
    if (debit !== credit) {
      throw new BadRequestException(
        `Lançamento desbalanceado: débitos ${fromCents(debit)} e créditos ${fromCents(credit)}`,
      );
    }

    const accounts = await this.chartService.findPostable(
      client.id,
      input.lines.map((l) => l.accountId),
    );

    const entry = manager.create(JournalEntryEntity, {
      client,
      date: input.date,
      description: input.description.slice(0, 255),
      source: input.source,
      createdBy: user.userId,
    });
    await manager.save(entry);

    const lines = input.lines.map((line) =>
      manager.create(JournalLineEntity, {
        entry,
        account: accounts.get(line.accountId)!,
        debit: fromCents(line.debitCents),
        credit: fromCents(line.creditCents),
        createdBy: user.userId,
      }),
    );
    await manager.save(lines);

    entry.lines = lines;
    return entry;
  }

  public async remove(user: CurrentUser, clientId: string, id: string) {
    const entry = await this.findOrFail(clientId, id);
    await this.closingService.assertOpen(clientId, entry.date);

    await JournalEntryEntity.getRepository().manager.transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .update(BankTransactionEntity)
        .set({
          journalEntry: null,
          status: BankTransactionStatusEnum.PENDING,
          updatedBy: user.userId,
        })
        .where('journal_entry_id = :id', { id: entry.id })
        .execute();
      await manager.update(JournalEntryEntity, { id: entry.id }, { deletedBy: user.userId });
      await manager.softDelete(JournalEntryEntity, { id: entry.id });
    });

    return { deleted: true };
  }

  private async findOrFail(clientId: string, id: string) {
    const entry = await JournalEntryEntity.findOne({
      where: { id, client: { id: clientId } },
      relations: { lines: { account: true } },
    });
    if (!entry) throw new NotFoundException('Lançamento não encontrado');
    return entry;
  }

  private serialize(entry: JournalEntryEntity, lockedUntil: string | null) {
    const lines = [...(entry.lines ?? [])]
      .filter((line) => !line.deletedAt)
      .sort((a, b) => toCents(b.debit) - toCents(a.debit));

    return {
      id: entry.id,
      date: entry.date,
      description: entry.description,
      source: entry.source,
      createdAt: entry.createdAt,
      locked: !!lockedUntil && entry.date <= lockedUntil,
      total: centsToNumber(lines.reduce((sum, l) => sum + toCents(l.debit), 0)),
      lines: lines.map((line) => ({
        id: line.id,
        account: {
          id: line.account.id,
          code: line.account.code,
          name: line.account.name,
        },
        debit: Number(line.debit),
        credit: Number(line.credit),
      })),
    };
  }
}
