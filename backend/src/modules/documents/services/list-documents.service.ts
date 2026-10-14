import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DocumentEntity } from '../../../entities/documents.entity';
import { UserRole } from '../../../enum/user-role.enum';
import { isXmlFile } from './download-document.service';

export interface ListDocumentsParams {
  userId: string;
  role?: string;
  clientId?: string;
}

@Injectable()
export class ListDocumentsService {
  public async execute({ userId, role, clientId }: ListDocumentsParams) {
    try {
      const query = DocumentEntity.createQueryBuilder('document')
        .withDeleted()
        .innerJoinAndSelect('document.client', 'client')
        .innerJoinAndSelect('document.documentType', 'documentType')
        .where('document.active = :active', { active: true })
        .andWhere('document.deletedAt IS NULL')
        .andWhere('client.deletedAt IS NULL')
        .orderBy('document.createdAt', 'DESC');

      if (clientId) {
        query.andWhere('client.id = :clientId', { clientId });
      }

      if (role !== UserRole.ADMIN) {
        query
          .innerJoin('client.userClients', 'uc')
          .andWhere('uc.deletedAt IS NULL')
          .andWhere('uc.user = :userId', { userId })
          .andWhere('document.visibleToClient = :visible', { visible: true });
      }

      const documents = await query.getMany();

      return documents.map((document) => ({
        id: document.id,
        title: document.title,
        number: document.number,
        notes: document.notes,
        issueDate: document.issueDate,
        expirationDate: document.expirationDate,
        alertDays: document.alertDays,
        fileName: document.fileName,
        fileMime: document.fileMime,
        fileSize: document.fileSize,
        hasFile: !!document.fileKey,
        isXml: !!document.fileKey && isXmlFile(document.fileName, document.fileMime),
        visibleToClient: document.visibleToClient,
        createdAt: document.createdAt,
        client: {
          id: document.client.id,
          name: document.client.name,
          cnpj: document.client.cnpj,
        },
        documentType: {
          id: document.documentType.id,
          code: document.documentType.code,
          name: document.documentType.name,
          category: document.documentType.category,
        },
      }));
    } catch (e: any) {
      throw new InternalServerErrorException(
        'Não foi possível listar os documentos, erro: ' + e.message,
      );
    }
  }
}
