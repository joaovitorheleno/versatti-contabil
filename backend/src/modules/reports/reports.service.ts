import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { In, SelectQueryBuilder } from 'typeorm';
import { ClientEntity } from '../../entities/client.entity';
import { DocumentTypeEntity } from '../../entities/document-type.entity';
import { DocumentEntity } from '../../entities/documents.entity';
import { UserEntity } from '../../entities/user.entity';
import { UserRole } from '../../enum/user-role.enum';
import { ReportQueryDto } from './dto/report-query.dto';

export type DocumentStatus = 'EXPIRED' | 'EXPIRING' | 'VALID' | 'NO_EXPIRATION';
export type ComplianceStatus = Exclude<DocumentStatus, 'NO_EXPIRATION'> | 'MISSING';

export interface CurrentUser {
  userId: string;
  role?: string;
}

const pad = (value: number) => String(value).padStart(2, '0');

const todayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const daysBetween = (from: string, to: string) =>
  Math.round(
    (new Date(`${to}T00:00:00`).getTime() -
      new Date(`${from}T00:00:00`).getTime()) /
      86_400_000,
  );

const getStatus = (
  expirationDate: string | null,
  alertDays: number | null,
  today: string,
): DocumentStatus => {
  if (!expirationDate) return 'NO_EXPIRATION';
  if (expirationDate < today) return 'EXPIRED';
  if (daysBetween(today, expirationDate) <= (alertDays ?? 0)) return 'EXPIRING';
  return 'VALID';
};

@Injectable()
export class ReportsService {
  private scopedDocuments(
    user: CurrentUser,
    filters: ReportQueryDto,
  ): SelectQueryBuilder<DocumentEntity> {
    const query = DocumentEntity.createQueryBuilder('document')
      .withDeleted()
      .innerJoinAndSelect('document.client', 'client')
      .innerJoinAndSelect('document.documentType', 'documentType')
      .where('document.active = :active', { active: true })
      .andWhere('document.deletedAt IS NULL')
      .andWhere('client.deletedAt IS NULL');

    if (user.role !== UserRole.ADMIN) {
      query
        .innerJoin('client.userClients', 'uc')
        .andWhere('uc.deletedAt IS NULL')
        .andWhere('uc.user = :userId', { userId: user.userId })
        .andWhere('document.visibleToClient = :visible', { visible: true });
    }

    if (filters.clientId) {
      query.andWhere('client.id = :clientId', { clientId: filters.clientId });
    }

    if (filters.category) {
      query.andWhere('documentType.category = :category', {
        category: filters.category,
      });
    }

    return query;
  }

  private validateRange(filters: ReportQueryDto) {
    if (!filters.from || !filters.to) {
      throw new BadRequestException('Informe a data inicial e a final');
    }
    if (filters.to < filters.from) {
      throw new BadRequestException(
        'A data final não pode ser anterior à inicial',
      );
    }
  }

  private mapClient(client: ClientEntity) {
    return { id: client.id, name: client.name, cnpj: client.cnpj };
  }

  public async expirations(user: CurrentUser, filters: ReportQueryDto) {
    this.validateRange(filters);

    try {
      const today = todayKey();

      const documents = await this.scopedDocuments(user, filters)
        .andWhere('document.expirationDate BETWEEN :from AND :to', {
          from: filters.from,
          to: filters.to,
        })
        .orderBy('document.expirationDate', 'ASC')
        .addOrderBy('client.name', 'ASC')
        .getMany();

      return documents.map((document) => ({
        id: document.id,
        client: this.mapClient(document.client),
        documentType: document.documentType.name,
        category: document.documentType.category,
        title: document.title,
        number: document.number,
        expirationDate: document.expirationDate,
        daysLeft: daysBetween(today, document.expirationDate!),
        status: getStatus(document.expirationDate, document.alertDays, today),
      }));
    } catch (e: any) {
      throw new InternalServerErrorException(
        'Não foi possível gerar o relatório de vencimentos, erro: ' + e.message,
      );
    }
  }

  public async compliance(user: CurrentUser, filters: ReportQueryDto) {
    try {
      const today = todayKey();

      const typesQuery = DocumentTypeEntity.createQueryBuilder('type')
        .where('type.active = :active', { active: true })
        .andWhere('type.requiresExpiration = :requires', { requires: true })
        .orderBy('type.category', 'ASC')
        .addOrderBy('type.name', 'ASC');

      if (filters.category) {
        typesQuery.andWhere('type.category = :category', {
          category: filters.category,
        });
      }

      const expectedTypes = await typesQuery.getMany();

      const clientsQuery = ClientEntity.createQueryBuilder('client')
        .where('client.isActive = :active', { active: true })
        .orderBy('client.name', 'ASC');

      if (user.role !== UserRole.ADMIN) {
        clientsQuery
          .innerJoin('client.userClients', 'uc')
          .andWhere('uc.user = :userId', { userId: user.userId });
      }
      if (filters.clientId) {
        clientsQuery.andWhere('client.id = :clientId', {
          clientId: filters.clientId,
        });
      }

      const clients = await clientsQuery.getMany();

      if (expectedTypes.length === 0 || clients.length === 0) {
        return { types: expectedTypes.map((t) => t.name), clients: [] };
      }

      const documents = await this.scopedDocuments(user, filters)
        .andWhere('documentType.id IN (:...typeIds)', {
          typeIds: expectedTypes.map((type) => type.id),
        })
        .andWhere('client.id IN (:...clientIds)', {
          clientIds: clients.map((client) => client.id),
        })
        .getMany();

      const latest = new Map<string, DocumentEntity>();
      documents.forEach((document) => {
        const key = `${document.client.id}:${document.documentType.id}`;
        const current = latest.get(key);
        if (
          !current ||
          (document.expirationDate ?? '') > (current.expirationDate ?? '')
        ) {
          latest.set(key, document);
        }
      });

      return {
        types: expectedTypes.map((type) => type.name),
        clients: clients.map((client) => {
          const items = expectedTypes.map((type) => {
            const document = latest.get(`${client.id}:${type.id}`);
            const status: ComplianceStatus = document
              ? (getStatus(
                  document.expirationDate,
                  document.alertDays,
                  today,
                ) as ComplianceStatus)
              : 'MISSING';

            return {
              documentType: type.name,
              category: type.category,
              status,
              expirationDate: document?.expirationDate ?? null,
              documentTitle: document?.title ?? null,
            };
          });

          const count = (status: ComplianceStatus) =>
            items.filter((item) => item.status === status).length;

          return {
            client: this.mapClient(client),
            valid: count('VALID'),
            expiring: count('EXPIRING'),
            expired: count('EXPIRED'),
            missing: count('MISSING'),
            items,
          };
        }),
      };
    } catch (e: any) {
      throw new InternalServerErrorException(
        'Não foi possível gerar o relatório de situação, erro: ' + e.message,
      );
    }
  }

  public async uploads(user: CurrentUser, filters: ReportQueryDto) {
    this.validateRange(filters);

    try {
      const documents = await this.scopedDocuments(user, filters)
        .andWhere('document.createdAt >= :from', {
          from: `${filters.from} 00:00:00`,
        })
        .andWhere('document.createdAt <= :to', { to: `${filters.to} 23:59:59` })
        .orderBy('document.createdAt', 'DESC')
        .getMany();

      const userIds = [
        ...new Set(documents.map((d) => d.createdBy).filter(Boolean)),
      ] as string[];

      const users = userIds.length
        ? await UserEntity.find({
            where: { id: In(userIds) },
            withDeleted: true,
            select: { id: true, name: true, role: true },
          })
        : [];

      const usersById = new Map(users.map((u) => [u.id, u]));

      return documents.map((document) => {
        const uploader = document.createdBy
          ? usersById.get(document.createdBy)
          : undefined;

        return {
          id: document.id,
          createdAt: document.createdAt,
          client: this.mapClient(document.client),
          documentType: document.documentType.name,
          category: document.documentType.category,
          title: document.title,
          fileName: document.fileName,
          uploadedBy: uploader?.name ?? null,
          uploadedByOffice: uploader ? uploader.role === UserRole.ADMIN : null,
          visibleToClient: document.visibleToClient,
        };
      });
    } catch (e: any) {
      throw new InternalServerErrorException(
        'Não foi possível gerar o relatório de envios, erro: ' + e.message,
      );
    }
  }
}
