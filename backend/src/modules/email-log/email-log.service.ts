import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { In } from 'typeorm';
import { ClientEntity } from '../../entities/client.entity';
import { EmailLogEntity } from '../../entities/email-log.entity';
import { UserEntity } from '../../entities/user.entity';
import {
  EmailCategoryEnum,
  EmailStatusEnum,
} from '../../enum/email-log.enum';
import { escapeHtml, renderMailLayout } from '../mail/mail-layout';
import { MailService } from '../mail/mail.service';
import { ListEmailLogQueryDto } from './dto/list-email-log-query.dto';

const MAX_RESULTS = 1000;
const SIGNATURE_TOLERANCE_SECONDS = 5 * 60;

const STATUS_RANK: Record<EmailStatusEnum, number> = {
  [EmailStatusEnum.SENT]: 1,
  [EmailStatusEnum.DELAYED]: 2,
  [EmailStatusEnum.DELIVERED]: 3,
  [EmailStatusEnum.OPENED]: 4,
  [EmailStatusEnum.BOUNCED]: 5,
  [EmailStatusEnum.COMPLAINED]: 5,
  [EmailStatusEnum.FAILED]: 5,
};

const EVENT_STATUS: Record<string, EmailStatusEnum> = {
  'email.delivery_delayed': EmailStatusEnum.DELAYED,
  'email.delivered': EmailStatusEnum.DELIVERED,
  'email.opened': EmailStatusEnum.OPENED,
  'email.clicked': EmailStatusEnum.OPENED,
  'email.bounced': EmailStatusEnum.BOUNCED,
  'email.complained': EmailStatusEnum.COMPLAINED,
  'email.failed': EmailStatusEnum.FAILED,
};

export interface ResendWebhookEvent {
  type: string;
  created_at?: string;
  data?: {
    email_id?: string;
    bounce?: { message?: string; type?: string; subType?: string };
    failed?: { reason?: string };
  };
}

@Injectable()
export class EmailLogService {
  private readonly logger = new Logger(EmailLogService.name);
  private readonly webhookSecret: string | null;

  constructor(
    config: ConfigService,
    private readonly mailService: MailService,
  ) {
    this.webhookSecret = config.get<string>('RESEND_WEBHOOK_SECRET') || null;
  }

  public async list(query: ListEmailLogQueryDto) {
    const qb = EmailLogEntity.createQueryBuilder('log')
      .orderBy('log.createdAt', 'DESC')
      .take(MAX_RESULTS);

    if (query.from) qb.andWhere('log.createdAt >= :from', { from: `${query.from} 00:00:00` });
    if (query.to) qb.andWhere('log.createdAt <= :to', { to: `${query.to} 23:59:59` });
    if (query.status) qb.andWhere('log.status = :status', { status: query.status });
    if (query.category) qb.andWhere('log.category = :category', { category: query.category });
    if (query.clientId) qb.andWhere('log.clientId = :clientId', { clientId: query.clientId });

    const logs = await qb.getMany();

    const userIds = [...new Set(logs.map((l) => l.sentBy).filter(Boolean))] as string[];
    const clientIds = [...new Set(logs.map((l) => l.clientId).filter(Boolean))] as string[];

    const [users, clients] = await Promise.all([
      userIds.length
        ? UserEntity.find({ where: { id: In(userIds) }, withDeleted: true, select: { id: true, name: true } })
        : [],
      clientIds.length
        ? ClientEntity.find({ where: { id: In(clientIds) }, withDeleted: true, select: { id: true, name: true } })
        : [],
    ]);

    const userName = new Map<string, string>(
      (users as UserEntity[]).map((u) => [u.id, u.name] as const),
    );
    const clientName = new Map<string, string>(
      (clients as ClientEntity[]).map((c) => [c.id, c.name] as const),
    );

    return logs.map((log) => ({
      id: log.id,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
      toEmail: log.toEmail,
      subject: log.subject,
      category: log.category,
      status: log.status,
      error: log.error,
      deliveredAt: log.deliveredAt,
      openedAt: log.openedAt,
      bouncedAt: log.bouncedAt,
      tracked: !!log.providerId,
      sentBy: log.sentBy ? { id: log.sentBy, name: userName.get(log.sentBy) ?? null } : null,
      client: log.clientId ? { id: log.clientId, name: clientName.get(log.clientId) ?? null } : null,
    }));
  }

  public verifySignature(headers: Record<string, any>, rawBody: Buffer | undefined) {
    if (!this.webhookSecret) {
      throw new ServiceUnavailableException('Webhook do Resend não configurado');
    }

    const id = headers['svix-id'];
    const timestamp = headers['svix-timestamp'];
    const signatures = headers['svix-signature'];

    if (!id || !timestamp || !signatures || !rawBody) {
      throw new UnauthorizedException('Assinatura ausente');
    }

    const age = Math.abs(Date.now() / 1000 - Number(timestamp));
    if (!Number.isFinite(age) || age > SIGNATURE_TOLERANCE_SECONDS) {
      throw new UnauthorizedException('Assinatura expirada');
    }

    const secret = Buffer.from(this.webhookSecret.replace(/^whsec_/, ''), 'base64');
    const expected = createHmac('sha256', secret)
      .update(`${id}.${timestamp}.${rawBody.toString('utf8')}`)
      .digest();

    const valid = String(signatures)
      .split(' ')
      .map((part) => part.split(',')[1])
      .filter(Boolean)
      .some((signature) => {
        const received = Buffer.from(signature, 'base64');
        return received.length === expected.length && timingSafeEqual(received, expected);
      });

    if (!valid) throw new UnauthorizedException('Assinatura inválida');
  }

  public async handleEvent(event: ResendWebhookEvent) {
    const status = EVENT_STATUS[event.type];
    const providerId = event.data?.email_id;
    if (!status || !providerId) return { ignored: true };

    const log = await EmailLogEntity.findOne({ where: { providerId } });
    if (!log) return { ignored: true };

    const at = event.created_at ? new Date(event.created_at) : new Date();

    if (status === EmailStatusEnum.DELIVERED) log.deliveredAt ??= at;
    if (status === EmailStatusEnum.OPENED) log.openedAt ??= at;
    if (status === EmailStatusEnum.BOUNCED) log.bouncedAt ??= at;

    const wasProblem = STATUS_RANK[log.status] === 5;
    if (STATUS_RANK[status] >= STATUS_RANK[log.status] && !wasProblem) {
      log.status = status;
    }

    if (status === EmailStatusEnum.BOUNCED || status === EmailStatusEnum.FAILED) {
      const reason = event.data?.bounce?.message ?? event.data?.failed?.reason;
      if (reason) log.error = reason.slice(0, 500);
    }

    await log.save();

    if (
      !wasProblem &&
      (status === EmailStatusEnum.BOUNCED || status === EmailStatusEnum.FAILED) &&
      log.category !== EmailCategoryEnum.BOUNCE_ALERT &&
      log.sentBy
    ) {
      this.notifyBounce(log).catch((e) =>
        this.logger.error(`Falha ao avisar sobre e-mail recusado: ${e?.message ?? e}`),
      );
    }

    return { updated: true };
  }

  private async notifyBounce(log: EmailLogEntity) {
    const sender = await UserEntity.findOne({
      where: { id: log.sentBy! },
      select: { id: true, name: true, email: true },
    });
    if (!sender?.email) return;

    await this.mailService.send({
      to: sender.email,
      subject: `E-mail não entregue - ${log.toEmail}`,
      html: renderMailLayout(
        'E-mail não entregue',
        `<p>Olá, ${escapeHtml(sender.name)}.</p>
         <p>O e-mail <strong>"${escapeHtml(log.subject)}"</strong> enviado para <strong>${escapeHtml(log.toEmail)}</strong> foi <strong style="color:#d03b3b;">recusado</strong> pelo servidor do destinatário.</p>
         ${log.error ? `<p style="color:#6b7a73;font-size:13px;">Motivo informado: ${escapeHtml(log.error)}</p>` : ''}
         <p>Confira se o endereço está correto no cadastro e envie novamente.</p>`,
      ),
      log: { category: EmailCategoryEnum.BOUNCE_ALERT, clientId: log.clientId, sentBy: null },
    });
  }
}
