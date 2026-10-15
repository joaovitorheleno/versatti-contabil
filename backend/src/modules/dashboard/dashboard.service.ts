import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ClientEntity } from '../../entities/client.entity';
import { DocumentEntity } from '../../entities/documents.entity';
import { DocumentCategoryEnum } from '../../enum/document-category.enum';
import { UserRole } from '../../enum/user-role.enum';
import {
  addMonthsToMonthKey,
  getDocumentStatus,
  monthKeyOf,
  todayKey,
  type DocumentStatus,
} from '../../common/utils/document-dates';

export interface DashboardParams {
  userId: string;
  role?: string;
}

@Injectable()
export class DashboardService {
  public async execute({ userId, role }: DashboardParams) {
    try {
      const admin = role === UserRole.ADMIN;

      const query = DocumentEntity.createQueryBuilder('document')
        .withDeleted()
        .innerJoin('document.client', 'client')
        .innerJoin('document.documentType', 'documentType')
        .select([
          'document.id',
          'document.expirationDate',
          'document.alertDays',
          'document.createdAt',
          'client.id',
          'client.name',
          'client.cnpj',
          'documentType.id',
          'documentType.category',
        ])
        .where('document.active = :active', { active: true })
        .andWhere('document.deletedAt IS NULL')
        .andWhere('client.deletedAt IS NULL');

      if (!admin) {
        query
          .innerJoin('client.userClients', 'uc')
          .andWhere('uc.deletedAt IS NULL')
          .andWhere('uc.user = :userId', { userId })
          .andWhere('document.visibleToClient = :visible', { visible: true });
      }

      const documents = await query.getMany();

      const today = todayKey();
      const currentMonth = today.slice(0, 7);
      const lastMonth = addMonthsToMonthKey(currentMonth, -1);

      const statusCount: Record<DocumentStatus, number> = {
        EXPIRED: 0,
        EXPIRING: 0,
        VALID: 0,
        NO_EXPIRATION: 0,
      };

      const expirationMonths = Array.from({ length: 6 }, (_, i) =>
        addMonthsToMonthKey(currentMonth, i),
      );
      const expirationsByMonth = new Map(expirationMonths.map((m) => [m, 0]));

      const uploadMonths = Array.from({ length: 12 }, (_, i) =>
        addMonthsToMonthKey(currentMonth, i - 11),
      );
      const uploadsByMonth = new Map(uploadMonths.map((m) => [m, 0]));

      const byCategory = new Map<DocumentCategoryEnum, number>();

      const pendingByClient = new Map<
        string,
        { clientId: string; name: string; cnpj: string; expired: number; expiring: number }
      >();

      let sentThisMonth = 0;
      let sentLastMonth = 0;

      for (const document of documents) {
        const status = getDocumentStatus(
          document.expirationDate,
          document.alertDays,
          today,
        );
        statusCount[status] += 1;

        if (document.expirationDate) {
          const month = document.expirationDate.slice(0, 7);
          if (expirationsByMonth.has(month) && document.expirationDate >= today) {
            expirationsByMonth.set(month, expirationsByMonth.get(month)! + 1);
          }
        }

        const uploadMonth = monthKeyOf(new Date(document.createdAt));
        if (uploadsByMonth.has(uploadMonth)) {
          uploadsByMonth.set(uploadMonth, uploadsByMonth.get(uploadMonth)! + 1);
        }
        if (uploadMonth === currentMonth) sentThisMonth += 1;
        if (uploadMonth === lastMonth) sentLastMonth += 1;

        const category = document.documentType.category;
        byCategory.set(category, (byCategory.get(category) ?? 0) + 1);

        if (status === 'EXPIRED' || status === 'EXPIRING') {
          const pending = pendingByClient.get(document.client.id) ?? {
            clientId: document.client.id,
            name: document.client.name,
            cnpj: document.client.cnpj,
            expired: 0,
            expiring: 0,
          };
          if (status === 'EXPIRED') pending.expired += 1;
          else pending.expiring += 1;
          pendingByClient.set(document.client.id, pending);
        }
      }

      const activeClients = admin
        ? await ClientEntity.count({ where: { isActive: true } })
        : await ClientEntity.createQueryBuilder('client')
            .innerJoin('client.userClients', 'uc')
            .where('uc.user = :userId', { userId })
            .andWhere('client.isActive = :active', { active: true })
            .getCount();

      return {
        summary: {
          totalDocuments: documents.length,
          expired: statusCount.EXPIRED,
          expiring: statusCount.EXPIRING,
          sentThisMonth,
          sentLastMonth,
          activeClients,
        },
        statusDistribution: (
          Object.keys(statusCount) as DocumentStatus[]
        ).map((status) => ({ status, count: statusCount[status] })),
        expirationsByMonth: expirationMonths.map((month) => ({
          month,
          count: expirationsByMonth.get(month)!,
        })),
        uploadsByMonth: uploadMonths.map((month) => ({
          month,
          count: uploadsByMonth.get(month)!,
        })),
        byCategory: Array.from(byCategory.entries())
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count),
        clientsWithPending: Array.from(pendingByClient.values())
          .sort(
            (a, b) =>
              b.expired - a.expired || b.expiring - a.expiring || a.name.localeCompare(b.name),
          )
          .slice(0, 10),
      };
    } catch (e: any) {
      throw new InternalServerErrorException(
        'Não foi possível carregar o dashboard, erro: ' + e.message,
      );
    }
  }
}
