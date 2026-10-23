import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import Redis from 'ioredis';
import { In } from 'typeorm';
import {
  BRAZIL_TIME_ZONE,
  addDays,
  daysBetween,
  getDocumentStatus,
  todayKey,
} from '../../common/utils/document-dates';
import { ClientEntity } from '../../entities/client.entity';
import { DocumentEntity } from '../../entities/documents.entity';
import { UserEntity } from '../../entities/user.entity';
import { UserRole } from '../../enum/user-role.enum';
import {
  escapeHtml,
  formatDateBr,
  renderMailLayout,
  renderTable,
} from '../mail/mail-layout';
import { MailService } from '../mail/mail.service';

const REMINDER_INTERVAL_DAYS = 7;
const STOP_AFTER_EXPIRED_DAYS = 30;
const LOCK_TTL_SECONDS = 23 * 60 * 60;

export interface ExpirationAlertsResult {
  date: string;
  documentsDue: number;
  clientEmailsSent: number;
  officeEmailSent: boolean;
  clientsWithoutEmail: string[];
  failures: string[];
}

@Injectable()
export class ExpirationAlertsService {
  private readonly logger = new Logger(ExpirationAlertsService.name);

  constructor(
    private readonly mailService: MailService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  @Cron('0 8 * * *', { name: 'expiration-alerts', timeZone: BRAZIL_TIME_ZONE })
  public async runScheduled() {
    const today = todayKey();
    const acquired = await this.redis.set(
      `alerts:expiration:${today}`,
      '1',
      'EX',
      LOCK_TTL_SECONDS,
      'NX',
    );

    if (!acquired) {
      this.logger.log(`Alertas de ${today} já executados por outra instância`);
      return;
    }

    const result = await this.run();
    this.logger.log(
      `Alertas de vencimento: ${result.documentsDue} documento(s), ${result.clientEmailsSent} e-mail(s) a clientes, escritório ${result.officeEmailSent ? 'notificado' : 'não notificado'}`,
    );
  }

  public async run(): Promise<ExpirationAlertsResult> {
    const today = todayKey();
    const result: ExpirationAlertsResult = {
      date: today,
      documentsDue: 0,
      clientEmailsSent: 0,
      officeEmailSent: false,
      clientsWithoutEmail: [],
      failures: [],
    };

    if (!this.mailService.isConfigured()) {
      result.failures.push('Envio de e-mail não configurado no servidor');
      return result;
    }

    const due = await this.findDueDocuments(today);
    result.documentsDue = due.length;
    if (due.length === 0) return result;

    const notified = new Set<string>();

    const byClient = new Map<
      string,
      { client: ClientEntity; documents: DocumentEntity[] }
    >();
    due.forEach((document) => {
      const group = byClient.get(document.client.id) ?? {
        client: document.client,
        documents: [],
      };
      group.documents.push(document);
      byClient.set(document.client.id, group);
    });

    for (const { client, documents } of byClient.values()) {
      const visible = documents.filter((d) => d.visibleToClient);
      if (visible.length === 0) continue;

      if (!client.responsibleEmail) {
        result.clientsWithoutEmail.push(client.name);
        continue;
      }

      try {
        await this.mailService.send({
          to: client.responsibleEmail,
          subject: `Documentos vencendo - ${client.name}`,
          html: this.buildClientHtml(client, visible, today),
        });
        result.clientEmailsSent += 1;
        visible.forEach((d) => notified.add(d.id));
      } catch (e: any) {
        result.failures.push(`${client.name}: ${e.message}`);
        this.logger.error(
          `Falha no alerta para ${client.responsibleEmail}: ${e.message}`,
        );
      }
    }

    const officeEmails = await this.findOfficeEmails();
    for (const email of officeEmails) {
      try {
        await this.mailService.send({
          to: email,
          subject: `Vencimentos de documentos - ${formatDateBr(today)}`,
          html: this.buildOfficeHtml(due, today, result.clientsWithoutEmail),
        });
        result.officeEmailSent = true;
      } catch (e: any) {
        result.failures.push(`Escritório (${email}): ${e.message}`);
        this.logger.error(`Falha no resumo para ${email}: ${e.message}`);
      }
    }

    if (result.officeEmailSent) due.forEach((d) => notified.add(d.id));

    if (notified.size > 0) {
      await DocumentEntity.update(
        { id: In([...notified]) },
        { lastAlertAt: today },
      );
    }

    return result;
  }

  private async findDueDocuments(today: string): Promise<DocumentEntity[]> {
    const documents = await DocumentEntity.createQueryBuilder('document')
      .withDeleted()
      .innerJoinAndSelect('document.client', 'client')
      .innerJoinAndSelect('document.documentType', 'documentType')
      .where('document.active = :active', { active: true })
      .andWhere('document.deletedAt IS NULL')
      .andWhere('client.deletedAt IS NULL')
      .andWhere('client.isActive = :clientActive', { clientActive: true })
      .andWhere('document.expirationDate IS NOT NULL')
      .andWhere('document.expirationDate >= :oldest', {
        oldest: addDays(today, -STOP_AFTER_EXPIRED_DAYS),
      })
      .getMany();

    const latest = new Map<string, DocumentEntity>();
    documents.forEach((document) => {
      const key = `${document.client.id}:${document.documentType.id}`;
      const current = latest.get(key);
      if (!current || document.expirationDate! > current.expirationDate!) {
        latest.set(key, document);
      }
    });

    return [...latest.values()]
      .filter((document) => {
        const status = getDocumentStatus(
          document.expirationDate,
          document.alertDays,
          today,
        );
        if (status !== 'EXPIRING' && status !== 'EXPIRED') return false;
        if (!document.lastAlertAt) return true;
        if (document.expirationDate === today && document.lastAlertAt < today)
          return true;
        return (
          daysBetween(document.lastAlertAt, today) >= REMINDER_INTERVAL_DAYS
        );
      })
      .sort((a, b) => a.expirationDate!.localeCompare(b.expirationDate!));
  }

  private async findOfficeEmails(): Promise<string[]> {
    const admins = await UserEntity.find({
      where: { role: UserRole.ADMIN },
      select: { email: true },
    });
    return [...new Set(admins.map((a) => a.email).filter(Boolean))];
  }

  private describeDeadline(expirationDate: string, today: string) {
    const days = daysBetween(today, expirationDate);
    if (days < 0)
      return `<strong style="color:#d03b3b;">vencido há ${-days} dia(s)</strong>`;
    if (days === 0) return '<strong style="color:#d03b3b;">vence hoje</strong>';
    return `vence em ${days} dia(s)`;
  }

  private buildClientHtml(
    client: ClientEntity,
    documents: DocumentEntity[],
    today: string,
  ) {
    const rows = documents.map((d) => [
      escapeHtml(d.title),
      escapeHtml(d.documentType.name),
      formatDateBr(d.expirationDate),
      this.describeDeadline(d.expirationDate!, today),
    ]);

    return renderMailLayout(
      'Documentos perto do vencimento',
      `<p>Olá,</p>
       <p>Os documentos abaixo da empresa <strong>${escapeHtml(client.name)}</strong> estão vencidos ou perto de vencer. Providencie a renovação e envie o novo documento ao escritório.</p>
       ${renderTable(['Documento', 'Tipo', 'Vencimento', 'Prazo'], rows)}`,
    );
  }

  private buildOfficeHtml(
    documents: DocumentEntity[],
    today: string,
    clientsWithoutEmail: string[],
  ) {
    const headers = ['Empresa', 'Documento', 'Tipo', 'Vencimento', 'Prazo'];
    const toRows = (list: DocumentEntity[]) =>
      list.map((d) => [
        escapeHtml(d.client.name),
        escapeHtml(d.title),
        escapeHtml(d.documentType.name),
        formatDateBr(d.expirationDate),
        this.describeDeadline(d.expirationDate!, today),
      ]);

    const expired = documents.filter((d) => d.expirationDate! <= today);
    const expiring = documents.filter((d) => d.expirationDate! > today);

    const warning = clientsWithoutEmail.length
      ? `<p style="color:#b45309;">Sem e-mail do responsável cadastrado (o cliente não foi avisado): <strong>${clientsWithoutEmail.map(escapeHtml).join(', ')}</strong>.</p>`
      : '';

    const expiredSection = expired.length
      ? `<h3 style="color:#d03b3b;">Documentos vencidos (${expired.length})</h3>
       ${renderTable(headers, toRows(expired))}`
      : '';

    const expiringSection = expiring.length
      ? `<h3>Documentos perto do vencimento (${expiring.length})</h3>
       ${renderTable(headers, toRows(expiring))}`
      : '';

    return renderMailLayout(
      `Vencimentos de documentos - ${formatDateBr(today)}`,
      `${warning}
       ${expiredSection}
       ${expiringSection}`,
    );
  }
}
