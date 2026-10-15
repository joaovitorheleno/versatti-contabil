import { Injectable, Logger } from '@nestjs/common';
import { In } from 'typeorm';
import { AuditLogEntity } from '../../entities/audit-log.entity';
import { ClientEntity } from '../../entities/client.entity';
import { UserEntity } from '../../entities/user.entity';
import { AuditActionEnum } from '../../enum/audit-action.enum';
import { ListAuditQueryDto } from './dto/list-audit-query.dto';

export interface AuditRecord {
  action: AuditActionEnum;
  userId?: string | null;
  clientId?: string | null;
  entityId?: string | null;
  description?: string | null;
}

const MAX_RESULTS = 1000;

export const requestMeta = (req: any) => {
  const forwarded = req?.headers?.['x-forwarded-for'];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim() || req?.ip || null;
  const userAgent = req?.headers?.['user-agent'] ?? null;
  return { ip: ip?.slice(0, 64) ?? null, userAgent: userAgent?.slice(0, 255) ?? null };
};

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  public async record(record: AuditRecord, req?: any) {
    try {
      const meta = requestMeta(req);
      await AuditLogEntity.create({
        action: record.action,
        userId: record.userId ?? req?.user?.userId ?? null,
        clientId: record.clientId ?? null,
        entityId: record.entityId ?? null,
        description: record.description?.slice(0, 255) ?? null,
        ip: meta.ip,
        userAgent: meta.userAgent,
      }).save();
    } catch (e: any) {
      this.logger.error(`Falha ao registrar auditoria ${record.action}: ${e.message}`);
    }
  }

  public async list(query: ListAuditQueryDto) {
    const qb = AuditLogEntity.createQueryBuilder('log')
      .orderBy('log.createdAt', 'DESC')
      .take(MAX_RESULTS);

    if (query.from) qb.andWhere('log.createdAt >= :from', { from: `${query.from} 00:00:00` });
    if (query.to) qb.andWhere('log.createdAt <= :to', { to: `${query.to} 23:59:59` });
    if (query.action) qb.andWhere('log.action = :action', { action: query.action });
    if (query.userId) qb.andWhere('log.userId = :userId', { userId: query.userId });
    if (query.clientId) qb.andWhere('log.clientId = :clientId', { clientId: query.clientId });

    const logs = await qb.getMany();
    return this.withNames(logs);
  }

  public async listForUser(userId: string) {
    const logs = await AuditLogEntity.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: MAX_RESULTS,
    });
    return this.withNames(logs);
  }

  private async withNames(logs: AuditLogEntity[]) {
    const userIds = [...new Set(logs.map((l) => l.userId).filter(Boolean))] as string[];
    const clientIds = [...new Set(logs.map((l) => l.clientId).filter(Boolean))] as string[];

    const [users, clients] = await Promise.all([
      userIds.length
        ? UserEntity.find({ where: { id: In(userIds) }, withDeleted: true, select: { id: true, name: true } })
        : [],
      clientIds.length
        ? ClientEntity.find({ where: { id: In(clientIds) }, withDeleted: true, select: { id: true, name: true } })
        : [],
    ]);

    const userName = new Map<string, string>(
      (users as UserEntity[]).map((u) => [u.id, u.name] as const),
    );
    const clientName = new Map<string, string>(
      (clients as ClientEntity[]).map((c) => [c.id, c.name] as const),
    );

    return logs.map((log) => ({
      id: log.id,
      createdAt: log.createdAt,
      action: log.action,
      user: log.userId ? { id: log.userId, name: userName.get(log.userId) ?? null } : null,
      client: log.clientId ? { id: log.clientId, name: clientName.get(log.clientId) ?? null } : null,
      entityId: log.entityId,
      description: log.description,
      ip: log.ip,
      userAgent: log.userAgent,
    }));
  }
}
