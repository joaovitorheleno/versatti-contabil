import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import 'multer';
import { In } from 'typeorm';
import { CurrentUser } from '../../../common/utils/client-access';
import { AccountEntity } from '../../../entities/account.entity';
import { BankImportEntity } from '../../../entities/bank-import.entity';
import { BankTransactionEntity } from '../../../entities/bank-transaction.entity';
import { ReconciliationRuleEntity } from '../../../entities/reconciliation-rule.entity';
import {
  AccountTypeEnum,
  BankTransactionStatusEnum,
  JournalSourceEnum,
  RuleDirectionEnum,
} from '../../../enum/accounting.enum';
import { parseBankStatement } from '../bank-statement.parser';
import {
  CreateRuleDto,
  ImportStatementDto,
  ListTransactionsQueryDto,
  ReconcileDto,
  UpdateTransactionStatusDto,
} from '../dto/accounting.dto';
import { toCents } from '../money';
import { ChartService, findClientOrFail } from './chart.service';
import { ClosingService } from './closing.service';
import { JournalService } from './journal.service';

const MAX_STATEMENT_SIZE = 5 * 1024 * 1024;
const MAX_RESULTS = 2000;

const normalize = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();

export interface ReconcileResult {
  reconciled: number;
  failed: { transactionId: string; description: string; reason: string }[];
}

@Injectable()
export class BankService {
  constructor(
    private readonly chartService: ChartService,
    private readonly journalService: JournalService,
    private readonly closingService: ClosingService,
  ) {}

  public async importStatement(
    user: CurrentUser,
    clientId: string,
    dto: ImportStatementDto,
    file: Express.Multer.File | undefined,
  ) {
    const client = await findClientOrFail(clientId);
    if (!file) throw new BadRequestException('Envie o arquivo do extrato (OFX ou CSV)');
    if (file.size > MAX_STATEMENT_SIZE) {
      throw new BadRequestException('O extrato deve ter no máximo 5 MB');
    }

    const bankAccount = await this.chartService.findOrFail(clientId, dto.bankAccountId);
    if (bankAccount.type !== AccountTypeEnum.ASSET || !bankAccount.analytic) {
      throw new BadRequestException(
        'Escolha uma conta analítica do Ativo para o banco (ex: 1.1.01.002 Bancos Conta Movimento)',
      );
    }

    const fileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const statement = parseBankStatement(file.buffer, fileName);

    const existing = await BankTransactionEntity.find({
      where: {
        bankAccount: { id: bankAccount.id },
        fitid: In(statement.transactions.map((t) => t.fitid)),
      },
      select: { id: true, fitid: true },
    });
    const known = new Set(existing.map((t) => t.fitid));
    const fresh = statement.transactions.filter((t) => !known.has(t.fitid));

    const rules = await this.loadRules(clientId);

    const result = await BankImportEntity.getRepository().manager.transaction(async (manager) => {
      const bankImport = manager.create(BankImportEntity, {
        client,
        bankAccount,
        fileName: fileName.slice(0, 255),
        format: statement.format,
        importedCount: fresh.length,
        duplicateCount: statement.transactions.length - fresh.length,
        createdBy: user.userId,
      });
      await manager.save(bankImport);

      const entities = fresh.map((t) =>
        manager.create(BankTransactionEntity, {
          client,
          bankAccount,
          import: bankImport,
          date: t.date,
          amount: (t.amountCents / 100).toFixed(2),
          description: t.description,
          fitid: t.fitid,
          status: BankTransactionStatusEnum.PENDING,
          suggestedAccount: this.matchRule(rules, t.description, t.amountCents),
          createdBy: user.userId,
        }),
      );
      await manager.save(entities, { chunk: 200 });

      return bankImport;
    });

    const dates = statement.transactions.map((t) => t.date).sort();

    return {
      id: result.id,
      format: statement.format,
      fileName,
      total: statement.transactions.length,
      imported: fresh.length,
      duplicates: statement.transactions.length - fresh.length,
      suggested: fresh.filter((t) => this.matchRule(rules, t.description, t.amountCents)).length,
      periodStart: dates[0],
      periodEnd: dates[dates.length - 1],
    };
  }

  public async listImports(clientId: string) {
    await findClientOrFail(clientId);
    const imports = await BankImportEntity.find({
      where: { client: { id: clientId } },
      relations: { bankAccount: true },
      order: { createdAt: 'DESC' },
      take: 100,
    });
    return imports.map((i) => ({
      id: i.id,
      fileName: i.fileName,
      format: i.format,
      importedCount: i.importedCount,
      duplicateCount: i.duplicateCount,
      createdAt: i.createdAt,
      bankAccount: { id: i.bankAccount.id, code: i.bankAccount.code, name: i.bankAccount.name },
    }));
  }

  public async listTransactions(clientId: string, query: ListTransactionsQueryDto) {
    await findClientOrFail(clientId);

    const qb = BankTransactionEntity.createQueryBuilder('tx')
      .leftJoinAndSelect('tx.bankAccount', 'bankAccount')
      .leftJoinAndSelect('tx.suggestedAccount', 'suggestedAccount')
      .leftJoinAndSelect('tx.journalEntry', 'journalEntry')
      .leftJoinAndSelect('journalEntry.lines', 'line')
      .leftJoinAndSelect('line.account', 'lineAccount')
      .where('tx.client_id = :clientId', { clientId })
      .orderBy('tx.date', 'DESC')
      .addOrderBy('tx.createdAt', 'DESC')
      .take(MAX_RESULTS);

    if (query.status) qb.andWhere('tx.status = :status', { status: query.status });
    if (query.bankAccountId) qb.andWhere('tx.bank_account_id = :bankAccountId', { bankAccountId: query.bankAccountId });
    if (query.from) qb.andWhere('tx.date >= :from', { from: query.from });
    if (query.to) qb.andWhere('tx.date <= :to', { to: query.to });

    const [transactions, lockedUntil] = await Promise.all([
      qb.getMany(),
      this.closingService.lockedUntil(clientId),
    ]);

    return {
      lockedUntil,
      transactions: transactions.map((tx) => {
        const counterpart = tx.journalEntry?.lines?.find(
          (line) => line.account.id !== tx.bankAccount.id,
        )?.account;
        return {
          id: tx.id,
          date: tx.date,
          amount: Number(tx.amount),
          description: tx.description,
          status: tx.status,
          locked: !!lockedUntil && tx.date <= lockedUntil,
          bankAccount: { id: tx.bankAccount.id, code: tx.bankAccount.code, name: tx.bankAccount.name },
          suggestedAccount: tx.suggestedAccount
            ? { id: tx.suggestedAccount.id, code: tx.suggestedAccount.code, name: tx.suggestedAccount.name }
            : null,
          journalEntryId: tx.journalEntry?.id ?? null,
          counterpart: counterpart
            ? { id: counterpart.id, code: counterpart.code, name: counterpart.name }
            : null,
        };
      }),
    };
  }

  public async reconcile(user: CurrentUser, clientId: string, dto: ReconcileDto): Promise<ReconcileResult> {
    const client = await findClientOrFail(clientId);

    const transactions = await BankTransactionEntity.find({
      where: { id: In(dto.items.map((i) => i.transactionId)), client: { id: clientId } },
      relations: { bankAccount: true },
    });
    const byId = new Map(transactions.map((t) => [t.id, t]));

    const result: ReconcileResult = { reconciled: 0, failed: [] };

    for (const item of dto.items) {
      const tx = byId.get(item.transactionId);
      if (!tx) {
        result.failed.push({ transactionId: item.transactionId, description: '-', reason: 'Movimentação não encontrada' });
        continue;
      }

      try {
        await this.reconcileOne(user, client, tx, item.accountId, item.description);
        result.reconciled += 1;
      } catch (e: any) {
        result.failed.push({ transactionId: tx.id, description: tx.description, reason: e.message });
      }
    }

    return result;
  }

  public async autoReconcile(user: CurrentUser, clientId: string): Promise<ReconcileResult> {
    await findClientOrFail(clientId);

    const rules = await this.loadRules(clientId);
    const pending = await BankTransactionEntity.find({
      where: { client: { id: clientId }, status: BankTransactionStatusEnum.PENDING },
      relations: { suggestedAccount: true },
    });

    const items = pending.flatMap((tx) => {
      const account =
        this.matchRule(rules, tx.description, toCents(tx.amount)) ?? tx.suggestedAccount;
      return account ? [{ transactionId: tx.id, accountId: account.id }] : [];
    });

    if (items.length === 0) return { reconciled: 0, failed: [] };
    return this.reconcile(user, clientId, { items });
  }

  public async updateStatus(
    user: CurrentUser,
    clientId: string,
    id: string,
    dto: UpdateTransactionStatusDto,
  ) {
    const tx = await BankTransactionEntity.findOne({
      where: { id, client: { id: clientId } },
      relations: { journalEntry: true },
    });
    if (!tx) throw new NotFoundException('Movimentação não encontrada');
    if (tx.status === BankTransactionStatusEnum.RECONCILED) {
      throw new BadRequestException('Movimentação já conciliada. Exclua o lançamento para desfazer.');
    }
    await this.closingService.assertOpen(clientId, tx.date);

    tx.status = dto.status;
    tx.updatedBy = user.userId;
    await tx.save();
    return { id: tx.id, status: tx.status };
  }

  public async listRules(clientId: string) {
    await findClientOrFail(clientId);
    const rules = await ReconciliationRuleEntity.find({
      where: { client: { id: clientId } },
      relations: { account: true },
      order: { keyword: 'ASC' },
    });
    return rules.map((r) => ({
      id: r.id,
      keyword: r.keyword,
      direction: r.direction,
      account: { id: r.account.id, code: r.account.code, name: r.account.name },
    }));
  }

  public async createRule(user: CurrentUser, clientId: string, dto: CreateRuleDto) {
    const client = await findClientOrFail(clientId);
    const accounts = await this.chartService.findPostable(clientId, [dto.accountId]);

    const rule = ReconciliationRuleEntity.create({
      client,
      keyword: dto.keyword.trim(),
      direction: dto.direction ?? RuleDirectionEnum.ANY,
      account: accounts.get(dto.accountId)!,
      createdBy: user.userId,
    });
    await rule.save();

    await this.refreshSuggestions(clientId);
    return { id: rule.id };
  }

  public async removeRule(user: CurrentUser, clientId: string, id: string) {
    const rule = await ReconciliationRuleEntity.findOne({ where: { id, client: { id: clientId } } });
    if (!rule) throw new NotFoundException('Regra não encontrada');
    rule.deletedBy = user.userId;
    await rule.save();
    await rule.softRemove();
    await this.refreshSuggestions(clientId);
    return { deleted: true };
  }

  private async reconcileOne(
    user: CurrentUser,
    client: Awaited<ReturnType<typeof findClientOrFail>>,
    tx: BankTransactionEntity,
    counterpartId: string,
    description?: string,
  ) {
    if (tx.status !== BankTransactionStatusEnum.PENDING) {
      throw new BadRequestException('Movimentação não está pendente');
    }
    if (counterpartId === tx.bankAccount.id) {
      throw new BadRequestException('A contrapartida não pode ser a própria conta do banco');
    }

    const cents = toCents(tx.amount);
    const value = Math.abs(cents);
    const moneyIn = cents > 0;

    await BankTransactionEntity.getRepository().manager.transaction(async (manager) => {
      const entry = await this.journalService.createEntry(manager, user, client, {
        date: tx.date,
        description: (description?.trim() || tx.description).slice(0, 255),
        source: JournalSourceEnum.BANK,
        lines: [
          { accountId: tx.bankAccount.id, debitCents: moneyIn ? value : 0, creditCents: moneyIn ? 0 : value },
          { accountId: counterpartId, debitCents: moneyIn ? 0 : value, creditCents: moneyIn ? value : 0 },
        ],
      });

      await manager
        .createQueryBuilder()
        .update(BankTransactionEntity)
        .set({ status: BankTransactionStatusEnum.RECONCILED, journalEntry: entry, updatedBy: user.userId })
        .where('id = :id AND status = :pending', { id: tx.id, pending: BankTransactionStatusEnum.PENDING })
        .execute();
    });

    tx.status = BankTransactionStatusEnum.RECONCILED;
  }

  private async loadRules(clientId: string) {
    const rules = await ReconciliationRuleEntity.find({
      where: { client: { id: clientId } },
      relations: { account: true },
    });
    return rules
      .filter((r) => r.account.active && r.account.analytic && !r.account.deletedAt)
      .map((r) => ({ ...r, normalized: normalize(r.keyword) }))
      .sort((a, b) => b.normalized.length - a.normalized.length);
  }

  private matchRule(
    rules: Awaited<ReturnType<BankService['loadRules']>>,
    description: string,
    amountCents: number,
  ): AccountEntity | null {
    const text = normalize(description);
    const rule = rules.find(
      (r) =>
        text.includes(r.normalized) &&
        (r.direction === RuleDirectionEnum.ANY ||
          (r.direction === RuleDirectionEnum.IN && amountCents > 0) ||
          (r.direction === RuleDirectionEnum.OUT && amountCents < 0)),
    );
    return rule?.account ?? null;
  }

  private async refreshSuggestions(clientId: string) {
    const rules = await this.loadRules(clientId);
    const pending = await BankTransactionEntity.find({
      where: { client: { id: clientId }, status: BankTransactionStatusEnum.PENDING },
      relations: { suggestedAccount: true },
    });

    const changed = pending.filter((tx) => {
      const match = this.matchRule(rules, tx.description, toCents(tx.amount));
      if ((match?.id ?? null) === (tx.suggestedAccount?.id ?? null)) return false;
      tx.suggestedAccount = match;
      return true;
    });

    if (changed.length) await BankTransactionEntity.save(changed, { chunk: 200 });
    return changed.length;
  }
}
