import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CurrentUser } from '../../../common/utils/client-access';
import { BankTransactionEntity } from '../../../entities/bank-transaction.entity';
import { PeriodClosingEntity } from '../../../entities/period-closing.entity';
import {
  BankTransactionStatusEnum,
  ClosingTypeEnum,
} from '../../../enum/accounting.enum';
import { CreateClosingDto } from '../dto/accounting.dto';
import { findClientOrFail } from './chart.service';

const lastDay = (year: number, month: number) =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

const pad = (n: number) => String(n).padStart(2, '0');

const formatBr = (date: string) => date.split('-').reverse().join('/');

export const periodRange = (type: ClosingTypeEnum, reference: string) => {
  const year = Number(reference.slice(0, 4));

  if (type === ClosingTypeEnum.YEAR) {
    if (reference.length !== 4) throw new BadRequestException('Use a referência AAAA');
    return { start: `${year}-01-01`, end: `${year}-12-31` };
  }

  if (type === ClosingTypeEnum.QUARTER) {
    const match = reference.match(/^\d{4}-T([1-4])$/);
    if (!match) throw new BadRequestException('Use a referência AAAA-T1 a AAAA-T4');
    const startMonth = (Number(match[1]) - 1) * 3 + 1;
    const endMonth = startMonth + 2;
    return {
      start: `${year}-${pad(startMonth)}-01`,
      end: `${year}-${pad(endMonth)}-${lastDay(year, endMonth)}`,
    };
  }

  const match = reference.match(/^\d{4}-(\d{2})$/);
  if (!match) throw new BadRequestException('Use a referência AAAA-MM');
  const month = Number(match[1]);
  return { start: `${year}-${pad(month)}-01`, end: `${year}-${pad(month)}-${lastDay(year, month)}` };
};

@Injectable()
export class ClosingService {
  public async lockedUntil(clientId: string): Promise<string | null> {
    const row = await PeriodClosingEntity.createQueryBuilder('closing')
      .select('MAX(closing.period_end)', 'max')
      .where('closing.client_id = :clientId', { clientId })
      .andWhere('closing.deletedAt IS NULL')
      .getRawOne<{ max: string | Date | null }>();

    if (!row?.max) return null;
    return typeof row.max === 'string'
      ? row.max.slice(0, 10)
      : row.max.toISOString().slice(0, 10);
  }

  public async assertOpen(clientId: string, ...dates: string[]) {
    const locked = await this.lockedUntil(clientId);
    if (!locked) return;
    const blocked = dates.find((date) => date <= locked);
    if (blocked) {
      throw new BadRequestException(
        `O período até ${formatBr(locked)} está fechado. Reabra o fechamento para alterar lançamentos de ${formatBr(blocked)}.`,
      );
    }
  }

  public async list(clientId: string) {
    await findClientOrFail(clientId);
    const closings = await PeriodClosingEntity.find({
      where: { client: { id: clientId } },
      order: { periodEnd: 'DESC' },
    });
    return {
      lockedUntil: await this.lockedUntil(clientId),
      closings: closings.map((c) => ({
        id: c.id,
        type: c.type,
        reference: c.reference,
        periodStart: c.periodStart,
        periodEnd: c.periodEnd,
        createdAt: c.createdAt,
        createdBy: c.createdBy,
      })),
    };
  }

  public async close(user: CurrentUser, clientId: string, dto: CreateClosingDto) {
    const client = await findClientOrFail(clientId);
    const { start, end } = periodRange(dto.type, dto.reference);

    const locked = await this.lockedUntil(clientId);
    if (locked && end <= locked) {
      throw new BadRequestException(`Este período já está fechado (fechado até ${formatBr(locked)})`);
    }

    const pending = await BankTransactionEntity.createQueryBuilder('tx')
      .where('tx.client_id = :clientId', { clientId })
      .andWhere('tx.status = :status', { status: BankTransactionStatusEnum.PENDING })
      .andWhere('tx.date <= :end', { end })
      .getCount();

    if (pending > 0) {
      throw new BadRequestException(
        `Há ${pending} movimentação(ões) de extrato pendente(s) até ${formatBr(end)}. Concilie ou ignore antes de fechar.`,
      );
    }

    const closing = PeriodClosingEntity.create({
      client,
      type: dto.type,
      reference: dto.reference,
      periodStart: start,
      periodEnd: end,
      createdBy: user.userId,
    });
    await closing.save();

    return this.list(clientId);
  }

  public async reopenLatest(user: CurrentUser, clientId: string) {
    const latest = await PeriodClosingEntity.findOne({
      where: { client: { id: clientId } },
      order: { periodEnd: 'DESC', createdAt: 'DESC' },
    });
    if (!latest) throw new NotFoundException('Não há fechamento para reabrir');

    latest.deletedBy = user.userId;
    await latest.save();
    await latest.softRemove();

    return this.list(clientId);
  }
}
