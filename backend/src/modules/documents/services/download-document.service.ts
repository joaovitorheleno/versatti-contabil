import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { gerarPDF } from '@alexssmusica/node-pdf-nfe';
import { createReadStream, existsSync, promises as fs } from 'fs';
import { extname } from 'path';
import type { Readable } from 'stream';
import { DocumentEntity } from '../../../entities/documents.entity';
import { UserClientEntity } from '../../../entities/user-client.entity';
import { UserRole } from '../../../enum/user-role.enum';
import { StorageService } from '../../storage/storage.service';

export type DownloadFormat = 'xml' | 'pdf';

export interface DownloadDocumentParams {
  documentId: string;
  userId: string;
  role?: string;
  format?: DownloadFormat;
}

export interface DownloadedFile {
  stream: Readable;
  fileName: string;
  fileMime: string;
}

export const isXmlFile = (fileName?: string | null, fileMime?: string | null) =>
  fileMime === 'application/xml' ||
  fileMime === 'text/xml' ||
  extname(fileName ?? '').toLowerCase() === '.xml';

@Injectable()
export class DownloadDocumentService {
  private readonly logger = new Logger(DownloadDocumentService.name);

  constructor(private readonly storageService: StorageService) {}

  public async execute({
    documentId,
    userId,
    role,
    format,
  }: DownloadDocumentParams): Promise<DownloadedFile> {
    const document = await DocumentEntity.findOne({
      where: { id: documentId, active: true },
      relations: { client: true },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado');
    }

    if (role !== UserRole.ADMIN) {
      const linked = await UserClientEntity.findOne({
        where: {
          user: { id: userId },
          client: { id: document.client.id },
        },
      });

      if (!linked || !document.visibleToClient) {
        throw new ForbiddenException(
          'Você não tem permissão para acessar este documento',
        );
      }
    }

    if (!document.fileKey) {
      throw new NotFoundException('Este documento não possui arquivo anexado');
    }

    const path = this.storageService.getPath(document.fileKey);

    if (!existsSync(path)) {
      throw new NotFoundException('Arquivo não encontrado no armazenamento');
    }

    const fileName = document.fileName ?? 'documento';
    const fileMime = document.fileMime ?? 'application/octet-stream';
    const isXml = isXmlFile(document.fileName, document.fileMime);

    if (format === 'xml' && !isXml) {
      throw new BadRequestException('Este documento não é um arquivo XML');
    }

    // PDF de um XML: gera o DANFE na hora a partir da nota
    if (format === 'pdf' && isXml) {
      return {
        stream: await this.generateDanfe(path),
        fileName: fileName.replace(/\.xml$/i, '') + '.pdf',
        fileMime: 'application/pdf',
      };
    }

    if (format === 'pdf' && fileMime !== 'application/pdf') {
      throw new BadRequestException(
        'Este documento não pode ser baixado em PDF',
      );
    }

    return {
      stream: createReadStream(path),
      fileName,
      fileMime: isXml ? 'application/xml' : fileMime,
    };
  }

  private async generateDanfe(path: string): Promise<Readable> {
    const xml = await fs.readFile(path, 'utf-8');

    // A biblioteca só entende NF-e (modelo 55) e NFC-e (65) autorizadas, com <nfeProc>.
    // NFS-e e CT-e têm layouts próprios e não geram DANFE.
    if (!/<nfeProc[\s>]/.test(xml)) {
      throw new UnprocessableEntityException(
        'Não foi possível gerar o PDF: o XML não é de uma NF-e/NFC-e autorizada (sem <nfeProc>). Baixe o XML.',
      );
    }

    try {
      return (await gerarPDF(xml)) as unknown as Readable;
    } catch (e: any) {
      this.logger.error(`Falha ao gerar DANFE de ${path}: ${e.message}`);
      throw new UnprocessableEntityException(
        'Não foi possível gerar o PDF desta nota a partir do XML. Baixe o XML.',
      );
    }
  }
}
