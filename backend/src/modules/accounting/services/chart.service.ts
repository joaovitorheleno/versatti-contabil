import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { In } from 'typeorm';
import { CurrentUser } from '../../../common/utils/client-access';
import { AccountEntity } from '../../../entities/account.entity';
import { BankTransactionEntity } from '../../../entities/bank-transaction.entity';
import { ClientEntity } from '../../../entities/client.entity';
import { JournalLineEntity } from '../../../entities/journal-line.entity';
import { ReconciliationRuleEntity } from '../../../entities/reconciliation-rule.entity';
import { CreateAccountDto, UpdateAccountDto } from '../dto/accounting.dto';
import { DEFAULT_CHART, isAnalyticCode } from '../default-chart';

export const compareCodes = (a: string, b: string) => {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if (pa[i] === undefined) return -1;
    if (pb[i] === undefined) return 1;
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
};

export const parentCode = (code: string) =>
  code.includes('.') ? code.slice(0, code.lastIndexOf('.')) : null;

export const findClientOrFail = async (clientId: string) => {
  const client = await ClientEntity.findOne({ where: { id: clientId } });
  if (!client) throw new NotFoundException('Empresa não encontrada');
  return client;
};

@Injectable()
export class ChartService {
  public async list(clientId: string) {
    await findClientOrFail(clientId);

    const accounts = await AccountEntity.find({ where: { client: { id: clientId } } });
    const used = await this.accountsWithLines(accounts.map((a) => a.id));

    return accounts
      .sort((a, b) => compareCodes(a.code, b.code))
      .map((account) => ({
        id: account.id,
        code: account.code,
        name: account.name,
        type: account.type,
        analytic: account.analytic,
        active: account.active,
        level: account.code.split('.').length,
        hasEntries: used.has(account.id),
      }));
  }

  public async createDefault(user: CurrentUser, clientId: string) {
    const client = await findClientOrFail(clientId);

    const existing = await AccountEntity.count({ where: { client: { id: clientId } } });
    if (existing > 0) {
      throw new ConflictException('Esta empresa já tem plano de contas');
    }

    const codes = DEFAULT_CHART.map(([code]) => code);
    const accounts = DEFAULT_CHART.map(([code, name, type]) =>
      AccountEntity.create({
        client,
        code,
        name,
        type,
        analytic: isAnalyticCode(code, codes),
        active: true,
        createdBy: user.userId,
      }),
    );

    await AccountEntity.save(accounts, { chunk: 50 });
    return this.list(clientId);
  }

  public async create(user: CurrentUser, clientId: string, dto: CreateAccountDto) {
    const client = await findClientOrFail(clientId);

    const duplicate = await AccountEntity.findOne({
      where: { client: { id: clientId }, code: dto.code },
    });
    if (duplicate) throw new ConflictException(`Já existe a conta ${dto.code}`);

    const parentAccountCode = parentCode(dto.code);
    let type = dto.type;

    if (parentAccountCode) {
      const parent = await AccountEntity.findOne({
        where: { client: { id: clientId }, code: parentAccountCode },
      });
      if (!parent) {
        throw new BadRequestException(`Crie antes a conta superior ${parentAccountCode}`);
      }

      if (parent.analytic) {
        const used = await this.accountsWithLines([parent.id]);
        if (used.size > 0) {
          throw new BadRequestException(
            `A conta ${parent.code} já tem lançamentos e não pode ganhar subcontas`,
          );
        }
        parent.analytic = false;
        parent.updatedBy = user.userId;
        await parent.save();
      }

      type = parent.type;
    }

    if (!type) throw new BadRequestException('Informe o tipo da conta');

    const account = AccountEntity.create({
      client,
      code: dto.code,
      name: dto.name.trim(),
      type,
      analytic: true,
      active: true,
      createdBy: user.userId,
    });
    await account.save();

    return account;
  }

  public async update(user: CurrentUser, clientId: string, id: string, dto: UpdateAccountDto) {
    const account = await this.findOrFail(clientId, id);
    if (dto.name !== undefined) account.name = dto.name.trim();
    if (dto.active !== undefined) account.active = dto.active;
    account.updatedBy = user.userId;
    await account.save();
    return account;
  }

  public async remove(user: CurrentUser, clientId: string, id: string) {
    const account = await this.findOrFail(clientId, id);

    const children = await AccountEntity.createQueryBuilder('account')
      .where('account.client_id = :clientId', { clientId })
      .andWhere('account.code LIKE :prefix', { prefix: `${account.code}.%` })
      .getCount();
    if (children > 0) throw new BadRequestException('Exclua antes as subcontas');

    const [lines, transactions, rules] = await Promise.all([
      JournalLineEntity.count({ where: { account: { id } } }),
      BankTransactionEntity.count({ where: { bankAccount: { id } } }),
      ReconciliationRuleEntity.count({ where: { account: { id } } }),
    ]);
    if (lines + transactions + rules > 0) {
      throw new BadRequestException(
        'A conta tem lançamentos, extratos ou regras. Desative em vez de excluir.',
      );
    }

    account.deletedBy = user.userId;
    await account.save();
    await account.softRemove();

    const parent = parentCode(account.code);
    if (parent) {
      const siblings = await AccountEntity.createQueryBuilder('account')
        .where('account.client_id = :clientId', { clientId })
        .andWhere('account.code LIKE :prefix', { prefix: `${parent}.%` })
        .getCount();
      if (siblings === 0) {
        await AccountEntity.createQueryBuilder()
          .update()
          .set({ analytic: true, updatedBy: user.userId })
          .where('client_id = :clientId AND code = :code', { clientId, code: parent })
          .execute();
      }
    }

    return { deleted: true };
  }

  public async findOrFail(clientId: string, id: string) {
    const account = await AccountEntity.findOne({
      where: { id, client: { id: clientId } },
    });
    if (!account) throw new NotFoundException('Conta não encontrada nesta empresa');
    return account;
  }

  public async findPostable(clientId: string, ids: string[]) {
    const unique = [...new Set(ids)];
    const accounts = await AccountEntity.find({
      where: { id: In(unique), client: { id: clientId } },
    });
    const byId = new Map(accounts.map((a) => [a.id, a]));

    unique.forEach((id) => {
      const account = byId.get(id);
      if (!account) throw new BadRequestException('Conta não encontrada nesta empresa');
      if (!account.analytic) {
        throw new BadRequestException(
          `A conta ${account.code} - ${account.name} é sintética e não recebe lançamentos`,
        );
      }
      if (!account.active) {
        throw new BadRequestException(`A conta ${account.code} - ${account.name} está inativa`);
      }
    });

    return byId;
  }

  private async accountsWithLines(ids: string[]) {
    if (ids.length === 0) return new Set<string>();
    const rows = await JournalLineEntity.createQueryBuilder('line')
      .innerJoin('line.entry', 'entry')
      .select('line.account_id', 'accountId')
      .where('line.account_id IN (:...ids)', { ids })
      .andWhere('entry.deletedAt IS NULL')
      .groupBy('line.account_id')
      .getRawMany<{ accountId: string }>();
    return new Set(rows.map((r) => r.accountId));
  }
}
