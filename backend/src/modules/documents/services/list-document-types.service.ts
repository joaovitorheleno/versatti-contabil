import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DocumentTypeEntity } from '../../../entities/document-type.entity';

@Injectable()
export class ListDocumentTypesService {
  public async execute(): Promise<DocumentTypeEntity[]> {
    try {
      return await DocumentTypeEntity.find({
        where: { active: true },
        order: { category: 'ASC', name: 'ASC' },
      });
    } catch (e: any) {
      throw new InternalServerErrorException(
        'Não foi possível listar os tipos de documento, erro: ' + e.message,
      );
    }
  }
}
