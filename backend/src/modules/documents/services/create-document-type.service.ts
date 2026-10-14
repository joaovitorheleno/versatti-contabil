import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DocumentTypeEntity } from '../../../entities/document-type.entity';
import { CreateDocumentTypeDto } from '../dto/create-document-type.dto';

@Injectable()
export class CreateDocumentTypeService {
  public async execute(
    dto: CreateDocumentTypeDto,
    userId: string,
  ): Promise<DocumentTypeEntity> {
    // withDeleted: o código é único no banco mesmo para tipos excluídos (soft delete)
    const existing = await DocumentTypeEntity.findOne({
      where: { code: dto.code },
      withDeleted: true,
    });

    if (existing && !existing.deletedAt) {
      throw new ConflictException(
        `Já existe um tipo de documento com o código "${dto.code}"`,
      );
    }

    const requiresExpiration = dto.requiresExpiration ?? false;

    if (!requiresExpiration && dto.defaultAlertDays != null) {
      throw new BadRequestException(
        'defaultAlertDays só pode ser informado quando o tipo exige vencimento',
      );
    }

    const data = {
      code: dto.code,
      name: dto.name.trim(),
      category: dto.category,
      requiresExpiration,
      defaultAlertDays: requiresExpiration
        ? (dto.defaultAlertDays ?? null)
        : null,
      active: true,
    };

    try {
      if (existing) {
        await DocumentTypeEntity.update(
          { id: existing.id },
          {
            ...data,
            deletedAt: null,
            deletedBy: () => 'NULL',
            updatedBy: userId,
          },
        );

        return (await DocumentTypeEntity.findOne({
          where: { id: existing.id },
        }))!;
      }

      const documentType = DocumentTypeEntity.create({
        ...data,
        createdBy: userId,
      });

      return await documentType.save();
    } catch (e: any) {
      if (e?.code === '23505') {
        throw new ConflictException(
          `Já existe um tipo de documento com o código "${dto.code}"`,
        );
      }

      throw new InternalServerErrorException(
        'Não foi possível criar o tipo de documento, erro: ' + e.message,
      );
    }
  }
}
