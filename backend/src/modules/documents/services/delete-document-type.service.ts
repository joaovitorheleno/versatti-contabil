import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DocumentTypeEntity } from '../../../entities/document-type.entity';
import { DocumentEntity } from '../../../entities/documents.entity';

@Injectable()
export class DeleteDocumentTypeService {
  public async execute(
    id: string,
    userId: string,
  ): Promise<{ message: string }> {
    const documentType = await DocumentTypeEntity.findOne({ where: { id } });

    if (!documentType) {
      throw new NotFoundException('Tipo de documento não encontrado');
    }

    try {
      const documentsCount = await DocumentEntity.count({
        where: { documentType: { id } },
      });

      await DocumentTypeEntity.update(
        { id },
        { deletedBy: userId, deletedAt: new Date() },
      );

      return {
        message:
          documentsCount > 0
            ? `Tipo "${documentType.name}" excluído. Os ${documentsCount} documento(s) já enviados com este tipo foram mantidos.`
            : `Tipo "${documentType.name}" excluído com sucesso`,
      };
    } catch (e: any) {
      throw new InternalServerErrorException(
        'Não foi possível excluir o tipo de documento, erro: ' + e.message,
      );
    }
  }
}
