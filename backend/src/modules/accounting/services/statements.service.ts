import { BadRequestException, Injectable } from '@nestjs/common';
import { todayKey } from '../../../common/utils/document-dates';
import { AccountEntity } from '../../../entities/account.entity';
import { JournalLineEntity } from '../../../entities/journal-line.entity';
import {
  AccountTypeEnum,
  DEBIT_NATURE_TYPES,
} from '../../../enum/accounting.enum';
import { BalanceSheetQueryDto, PeriodQueryDto } from '../dto/accounting.dto';
import { centsToNumber } from '../money';
import { compareCodes, findClientOrFail } from './chart.service';

export interface Movement {
  opening: number;
  debit: number;
  credit: number;
}

export interface StatementLine {
  code: string;
  name: string;
  level: number;
  value: number;
}

const firstDayOfYear = (date: string) => `${date.slice(0, 4)}-01-01`;

const isUnder = (code: string, prefix: string) =>
  code === prefix || code.startsWith(`${prefix}.`);

@Injectable()
export class StatementsService {
  public async trialBalance(clientId: string, query: PeriodQueryDto) {
    const client = await findClientOrFail(clientId);
    const { from, to } = this.period(query);

    const accounts = await this.accounts(clientId);
    const movements = await this.movements(clientId, from, to);

    const rows = accounts
      .map((account) => {
        const totals = this.sumUnder(account, accounts, movements);
        const sign = DEBIT_NATURE_TYPES.includes(account.type) ? 1 : -1;
        const closing = totals.opening + totals.debit - totals.credit;
        return {
          id: account.id,
          code: account.code,
          name: account.name,
          type: account.type,
          analytic: account.analytic,
          level: account.code.split('.').length,
          opening: centsToNumber(totals.opening * sign),
          debit: centsToNumber(totals.debit),
          credit: centsToNumber(totals.credit),
          closing: centsToNumber(closing * sign),
          openingSide: this.side(totals.opening),
          closingSide: this.side(closing),
        };
      })
      .filter((row) => row.opening !== 0 || row.debit !== 0 || row.credit !== 0 || row.closing !== 0);

    const analytic = accounts.filter((a) => a.analytic);
    const totalDebit = analytic.reduce((sum, a) => sum + (movements.get(a.id)?.debit ?? 0), 0);
    const totalCredit = analytic.reduce((sum, a) => sum + (movements.get(a.id)?.credit ?? 0), 0);

    return {
      client: { id: client.id, name: client.name, cnpj: client.cnpj },
      from,
      to,
      rows,
      totals: {
        debit: centsToNumber(totalDebit),
        credit: centsToNumber(totalCredit),
        balanced: totalDebit === totalCredit,
      },
    };
  }

  public async incomeStatement(clientId: string, query: PeriodQueryDto) {
    const client = await findClientOrFail(clientId);
    const { from, to } = this.period(query);

    const accounts = await this.accounts(clientId);
    const movements = await this.movements(clientId, from, to);

    const resultOf = (account: AccountEntity) => {
      const totals = this.sumUnder(account, accounts, movements);
      return totals.credit - totals.debit;
    };

    const groups = (type: AccountTypeEnum, include: (code: string) => boolean, level: number) =>
      accounts
        .filter((a) => a.type === type && a.code.split('.').length === level && include(a.code))
        .map((a) => ({ account: a, cents: resultOf(a) }))
        .filter((g) => g.cents !== 0);

    const sumGroups = (list: { cents: number }[]) => list.reduce((s, g) => s + g.cents, 0);
    const toLines = (list: { account: AccountEntity; cents: number }[], negate = false): StatementLine[] =>
      list.map(({ account, cents }) => ({
        code: account.code,
        name: account.name,
        level: account.code.split('.').length,
        value: centsToNumber(negate ? -cents : cents),
      }));

    const grossRevenue = groups(AccountTypeEnum.REVENUE, (c) => isUnder(c, '3.1'), 3);
    const deductions = groups(AccountTypeEnum.REVENUE, (c) => isUnder(c, '3.2'), 3);
    const otherRevenue = groups(
      AccountTypeEnum.REVENUE,
      (c) => !isUnder(c, '3.1') && !isUnder(c, '3.2'),
      3,
    );
    const costs = groups(AccountTypeEnum.EXPENSE, (c) => isUnder(c, '4.1'), 3);
    const operating = groups(AccountTypeEnum.EXPENSE, (c) => isUnder(c, '4.2'), 3);
    const otherExpenses = groups(
      AccountTypeEnum.EXPENSE,
      (c) => !isUnder(c, '4.1') && !isUnder(c, '4.2'),
      3,
    );

    const gross = sumGroups(grossRevenue);
    const net = gross + sumGroups(deductions);
    const grossProfit = net + sumGroups(costs);
    const operatingResult = grossProfit + sumGroups(operating);
    const result = operatingResult + sumGroups(otherRevenue) + sumGroups(otherExpenses);

    const sections = [
      { key: 'grossRevenue', label: 'Receita bruta', lines: toLines(grossRevenue), total: centsToNumber(gross) },
      { key: 'deductions', label: '(-) Deduções da receita', lines: toLines(deductions), total: centsToNumber(sumGroups(deductions)) },
      { key: 'netRevenue', label: '= Receita líquida', lines: [], total: centsToNumber(net), subtotal: true },
      { key: 'costs', label: '(-) Custos', lines: toLines(costs), total: centsToNumber(sumGroups(costs)) },
      { key: 'grossProfit', label: '= Lucro bruto', lines: [], total: centsToNumber(grossProfit), subtotal: true },
      { key: 'operating', label: '(-) Despesas operacionais', lines: toLines(operating), total: centsToNumber(sumGroups(operating)) },
      { key: 'operatingResult', label: '= Resultado operacional', lines: [], total: centsToNumber(operatingResult), subtotal: true },
      { key: 'otherRevenue', label: '(+) Outras receitas', lines: toLines(otherRevenue), total: centsToNumber(sumGroups(otherRevenue)) },
      { key: 'otherExpenses', label: '(-) Despesas financeiras e outras', lines: toLines(otherExpenses), total: centsToNumber(sumGroups(otherExpenses)) },
      { key: 'result', label: result >= 0 ? '= Lucro do período' : '= Prejuízo do período', lines: [], total: centsToNumber(result), subtotal: true },
    ];

    return {
      client: { id: client.id, name: client.name, cnpj: client.cnpj },
      from,
      to,
      sections,
      result: centsToNumber(result),
    };
  }

  public async balanceSheet(clientId: string, query: BalanceSheetQueryDto) {
    const client = await findClientOrFail(clientId);
    const date = query.date?.slice(0, 10) ?? todayKey();

    const accounts = await this.accounts(clientId);
    const movements = await this.movements(clientId, null, date);

    const balanceOf = (account: AccountEntity) => {
      const totals = this.sumUnder(account, accounts, movements);
      const net = totals.debit - totals.credit;
      return DEBIT_NATURE_TYPES.includes(account.type) ? net : -net;
    };

    const tree = (type: AccountTypeEnum) =>
      accounts
        .filter((a) => {
          const level = a.code.split('.').length;
          return a.type === type && level >= 2 && level <= 3;
        })
        .map((a) => ({ account: a, cents: balanceOf(a) }))
        .filter((item) => item.cents !== 0)
        .map(({ account, cents }) => ({
          code: account.code,
          name: account.name,
          level: account.code.split('.').length,
          value: centsToNumber(cents),
        }));

    const total = (type: AccountTypeEnum) =>
      accounts
        .filter((a) => a.type === type && a.analytic)
        .reduce((sum, a) => sum + balanceOf(a), 0);

    const assets = total(AccountTypeEnum.ASSET);
    const liabilities = total(AccountTypeEnum.LIABILITY);
    const equity = total(AccountTypeEnum.EQUITY);
    const accumulatedResult =
      total(AccountTypeEnum.REVENUE) - total(AccountTypeEnum.EXPENSE);

    const equityLines = tree(AccountTypeEnum.EQUITY);
    if (accumulatedResult !== 0) {
      equityLines.push({
        code: '',
        name: accumulatedResult >= 0
          ? 'Resultado acumulado (lucro ainda não destinado)'
          : 'Resultado acumulado (prejuízo ainda não absorvido)',
        level: 2,
        value: centsToNumber(accumulatedResult),
      });
    }

    const liabilitiesAndEquity = liabilities + equity + accumulatedResult;

    return {
      client: { id: client.id, name: client.name, cnpj: client.cnpj },
      date,
      assets: { lines: tree(AccountTypeEnum.ASSET), total: centsToNumber(assets) },
      liabilities: { lines: tree(AccountTypeEnum.LIABILITY), total: centsToNumber(liabilities) },
      equity: { lines: equityLines, total: centsToNumber(equity + accumulatedResult) },
      liabilitiesAndEquity: centsToNumber(liabilitiesAndEquity),
      balanced: assets === liabilitiesAndEquity,
    };
  }

  private period(query: PeriodQueryDto) {
    const to = query.to?.slice(0, 10) ?? todayKey();
    const from = query.from?.slice(0, 10) ?? firstDayOfYear(to);
    if (from > to) throw new BadRequestException('A data inicial deve ser anterior à final');
    return { from, to };
  }

  private async accounts(clientId: string) {
    const accounts = await AccountEntity.find({
      where: { client: { id: clientId } },
      withDeleted: true,
    });
    return accounts.sort((a, b) => compareCodes(a.code, b.code));
  }

  private async movements(clientId: string, from: string | null, to: string) {
    const qb = JournalLineEntity.createQueryBuilder('line')
      .innerJoin('line.entry', 'entry')
      .select('line.account_id', 'accountId')
      .addSelect(
        from
          ? `SUM(CASE WHEN entry.date < :from THEN line.debit - line.credit ELSE 0 END)`
          : '0',
        'opening',
      )
      .addSelect(
        from
          ? `SUM(CASE WHEN entry.date >= :from THEN line.debit ELSE 0 END)`
          : 'SUM(line.debit)',
        'debit',
      )
      .addSelect(
        from
          ? `SUM(CASE WHEN entry.date >= :from THEN line.credit ELSE 0 END)`
          : 'SUM(line.credit)',
        'credit',
      )
      .where('entry.client_id = :clientId', { clientId })
      .andWhere('entry.deletedAt IS NULL')
      .andWhere('entry.date <= :to', { to })
      .groupBy('line.account_id');

    if (from) qb.setParameter('from', from);

    const rows = await qb.getRawMany<{
      accountId: string;
      opening: string;
      debit: string;
      credit: string;
    }>();

    return new Map<string, Movement>(
      rows.map((r) => [
        r.accountId,
        {
          opening: Math.round(Number(r.opening) * 100),
          debit: Math.round(Number(r.debit) * 100),
          credit: Math.round(Number(r.credit) * 100),
        },
      ]),
    );
  }

  private sumUnder(account: AccountEntity, accounts: AccountEntity[], movements: Map<string, Movement>): Movement {
    const scope = account.analytic
      ? [account]
      : accounts.filter((a) => a.analytic && isUnder(a.code, account.code));

    return scope.reduce<Movement>(
      (sum, a) => {
        const m = movements.get(a.id);
        if (!m) return sum;
        return {
          opening: sum.opening + m.opening,
          debit: sum.debit + m.debit,
          credit: sum.credit + m.credit,
        };
      },
      { opening: 0, debit: 0, credit: 0 },
    );
  }

  private side(cents: number) {
    if (cents === 0) return '';
    return cents > 0 ? 'D' : 'C';
  }
}
