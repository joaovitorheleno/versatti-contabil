import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ClientEntity } from '../../../entities/client.entity';
import { DocumentEntity } from '../../../entities/documents.entity';
import { DocumentTypeEntity } from '../../../entities/document-type.entity';
import { extname } from 'path';
import { CreateDocumentDto } from '../dto/create-document.dto';
import { UserClientEntity } from '../../../entities/user-client.entity';
import { UserRole } from '../../../enum/user-role.enum';
import { StorageService } from '../../storage/storage.service';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/xml',
  'text/xml',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.docx', '.xlsx', '.xml'];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface CurrentUser {
  userId: string;
  role?: string;
}

@Injectable()
export class CreateDocumentService {
  constructor(private readonly storageService: StorageService) {}

  public async execute(
    dto: CreateDocumentDto,
    file: Express.Multer.File | undefined,
    currentUser: CurrentUser,
  ): Promise<DocumentEntity> {
    const client = await ClientEntity.findOne({ where: { id: dto.clientId } });
    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const admin = currentUser.role === UserRole.ADMIN;

    if (!admin) {
      const linked = await UserClientEntity.findOne({
        where: {
          user: { id: currentUser.userId },
          client: { id: client.id },
        },
      });

      if (!linked) {
        throw new ForbiddenException(
          'Você não tem permissão para enviar documentos para esta empresa',
        );
      }
    }

    const documentType = await DocumentTypeEntity.findOne({
      where: { id: dto.documentTypeId },
    });
    if (!documentType || !documentType.active) {
      throw new NotFoundException(
        'Tipo de documento não encontrado ou inativo',
      );
    }

    if (documentType.requiresExpiration && !dto.expirationDate) {
      throw new BadRequestException(
        `O tipo "${documentType.name}" exige data de vencimento`,
      );
    }

    if (
      dto.issueDate &&
      dto.expirationDate &&
      dto.expirationDate < dto.issueDate
    ) {
      throw new BadRequestException(
        'A data de vencimento não pode ser anterior à data de emissão',
      );
    }

    if (file) {
      const extension = extname(file.originalname).toLowerCase();

      if (
        !ALLOWED_MIME_TYPES.includes(file.mimetype) &&
        !ALLOWED_EXTENSIONS.includes(extension)
      ) {
        throw new BadRequestException(
          'Tipo de arquivo não permitido. Envie XML, PDF, imagem, Word ou Excel',
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        throw new BadRequestException('O arquivo deve ter no máximo 10 MB');
      }
    }

    let fileKey: string | null = null;

    try {
      if (file) {
        fileKey = await this.storageService.upload(
          file,
          `clients/${client.id}/documents`,
        );
      }

      const document = DocumentEntity.create({
        client: { id: client.id },
        documentType: { id: documentType.id },
        title: dto.title.trim(),
        number: dto.number?.trim() || null,
        notes: dto.notes?.trim() || null,
        issueDate: dto.issueDate ?? null,
        expirationDate: dto.expirationDate ?? null,
        alertDays: dto.expirationDate
          ? (dto.alertDays ?? documentType.defaultAlertDays ?? null)
          : null,
        visibleToClient: admin ? (dto.visibleToClient ?? true) : true,
        fileKey,
        fileName: file?.originalname ?? null,
        fileMime: file?.mimetype ?? null,
        fileSize: file ? String(file.size) : null,
        createdBy: currentUser.userId,
      });

      return await document.save();
    } catch (e: any) {
      if (fileKey) {
        await this.storageService.delete(fileKey).catch(() => undefined);
      }

      throw new InternalServerErrorException(
        'Não foi possível criar o documento, erro: ' + e.message,
      );
    }
  }
}
