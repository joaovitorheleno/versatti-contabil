import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { existsSync } from 'fs';
import { In } from 'typeorm';
import { ClientEntity } from '../../../entities/client.entity';
import { DocumentEntity } from '../../../entities/documents.entity';
import { UserClientEntity } from '../../../entities/user-client.entity';
import { MailService, type MailAttachment } from '../../mail/mail.service';
import { StorageService } from '../../storage/storage.service';

const MAX_ATTACHMENTS_SIZE = 20 * 1024 * 1024;

export interface NotifyOptions {
  includeResponsible?: boolean;
  userIds?: string[];
}

export interface NotifyResult {
  sent: { client: string; email: string; documents: number; attached: number }[];
  skipped: { client: string; reason: string }[];
  failed: { client: string; reason: string }[];
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const formatDate = (date: string | null) =>
  date ? date.split('-').reverse().join('/') : '-';

@Injectable()
export class NotifyDocumentsService {
  private readonly logger = new Logger(NotifyDocumentsService.name);

  constructor(
    private readonly mailService: MailService,
    private readonly storageService: StorageService,
  ) {}

  public async execute(
    documentIds: string[],
    { includeResponsible = true, userIds = [] }: NotifyOptions = {},
  ): Promise<NotifyResult> {
    if (!this.mailService.isConfigured()) {
      throw new ServiceUnavailableException(
        'O envio de e-mail não está configurado no servidor',
      );
    }

    const documents = (
      await DocumentEntity.find({
        where: { id: In(documentIds), active: true },
        relations: { client: true, documentType: true },
        withDeleted: true,
      })
    ).filter((document) => !document.deletedAt);

    const byClient = new Map<string, { client: ClientEntity; documents: DocumentEntity[] }>();

    documents.forEach((document) => {
      const group = byClient.get(document.client.id) ?? {
        client: document.client,
        documents: [],
      };
      group.documents.push(document);
      byClient.set(document.client.id, group);
    });

    const result: NotifyResult = { sent: [], skipped: [], failed: [] };

    for (const { client, documents: clientDocuments } of byClient.values()) {
      const visibleDocuments = clientDocuments.filter((d) => d.visibleToClient);

      if (visibleDocuments.length === 0) {
        result.skipped.push({
          client: client.name,
          reason: 'Nenhum documento visível para o cliente',
        });
        continue;
      }

      const recipients = await this.resolveRecipients(
        client,
        includeResponsible,
        userIds,
      );

      if (recipients.length === 0) {
        result.skipped.push({
          client: client.name,
          reason: 'Nenhum destinatário com e-mail para esta empresa',
        });
        continue;
      }

      const attachments: MailAttachment[] = [];
      const notAttached: DocumentEntity[] = [];
      let totalSize = 0;

      visibleDocuments.forEach((document) => {
        if (!document.fileKey) return;

        const path = this.storageService.getPath(document.fileKey);
        const size = Number(document.fileSize ?? 0);

        if (!existsSync(path) || totalSize + size > MAX_ATTACHMENTS_SIZE) {
          notAttached.push(document);
          return;
        }

        totalSize += size;
        attachments.push({
          filename: document.fileName ?? 'documento',
          path,
          contentType: document.fileMime ?? undefined,
        });
      });

      const subject =
        visibleDocuments.length > 1
          ? `${visibleDocuments.length} novos documentos - ${client.name}`
          : `Novo documento - ${client.name}`;
      const html = this.buildHtml(client, visibleDocuments, notAttached);

      for (const email of recipients) {
        try {
          await this.mailService.send({ to: email, subject, html, attachments });

          result.sent.push({
            client: client.name,
            email,
            documents: visibleDocuments.length,
            attached: attachments.length,
          });
        } catch (e: any) {
          this.logger.error(`Falha ao enviar e-mail para ${email}: ${e.message}`);
          result.failed.push({
            client: client.name,
            reason: `${email}: ${e.message}`,
          });
        }
      }
    }

    return result;
  }

  private async resolveRecipients(
    client: ClientEntity,
    includeResponsible: boolean,
    userIds: string[],
  ): Promise<string[]> {
    const emails: string[] = [];

    if (includeResponsible && client.responsibleEmail) {
      emails.push(client.responsibleEmail);
    }

    if (userIds.length > 0) {
      const links = await UserClientEntity.find({
        where: { client: { id: client.id }, user: { id: In(userIds) } },
        relations: { user: true },
      });
      links.forEach((link) => link.user?.email && emails.push(link.user.email));
    }

    const unique = new Map<string, string>();
    emails.forEach((email) => {
      const key = email.trim().toLowerCase();
      if (!unique.has(key)) unique.set(key, email.trim());
    });
    return [...unique.values()];
  }

  private buildHtml(
    client: ClientEntity,
    documents: DocumentEntity[],
    notAttached: DocumentEntity[],
  ): string {
    const rows = documents
      .map(
        (document) => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #eef0ef;">${escapeHtml(document.title)}</td>
            <td style="padding:8px;border-bottom:1px solid #eef0ef;">${escapeHtml(document.documentType?.name ?? '-')}</td>
            <td style="padding:8px;border-bottom:1px solid #eef0ef;">${formatDate(document.expirationDate)}</td>
          </tr>`,
      )
      .join('');

    const notAttachedNote =
      notAttached.length > 0
        ? `<p style="color:#6b7a73;font-size:13px;">${notAttached.length} arquivo(s) não foram anexados por excederem o limite de tamanho do e-mail. Acesse o sistema Versatti para baixá-los.</p>`
        : '';

    return `
      <div style="font-family:Arial,sans-serif;color:#12231c;max-width:640px;">
        <h2 style="color:#16302a;">Novos documentos disponíveis</h2>
        <p>Olá,</p>
        <p>O escritório enviou ${documents.length > 1 ? `${documents.length} novos documentos` : 'um novo documento'} para a empresa <strong>${escapeHtml(client.name)}</strong>.</p>
        <table style="border-collapse:collapse;width:100%;font-size:14px;">
          <thead>
            <tr style="background:#f7f9f8;text-align:left;">
              <th style="padding:8px;">Documento</th>
              <th style="padding:8px;">Tipo</th>
              <th style="padding:8px;">Vencimento</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p>Os arquivos seguem em anexo.</p>
        ${notAttachedNote}
        <p style="color:#6b7a73;font-size:12px;margin-top:24px;">Este é um e-mail automático do sistema Versatti. Não responda.</p>
      </div>`;
  }
}
