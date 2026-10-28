import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { createTransport, type Transporter } from 'nodemailer';
import { EmailLogEntity } from '../../entities/email-log.entity';
import {
  EmailCategoryEnum,
  EmailStatusEnum,
} from '../../enum/email-log.enum';

export interface MailAttachment {
  filename: string;
  path: string;
  contentType?: string;
}

export interface MailLogInfo {
  category?: EmailCategoryEnum;
  clientId?: string | null;
  sentBy?: string | null;
}

export interface SendMailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: MailAttachment[];
  log?: MailLogInfo;
}

const RESEND_URL = 'https://api.resend.com/emails';
const RESEND_TIMEOUT_MS = 30_000;
const DEFAULT_MIN_INTERVAL_MS = 1_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null = null;
  private readonly resendApiKey: string | null = null;
  private readonly from: string;
  private readonly replyTo: string | undefined;
  private readonly minIntervalMs: number;
  private queue: Promise<unknown> = Promise.resolve();
  private lastSentAt = 0;

  constructor(config: ConfigService) {
    const user = config.get<string>('SMTP_USER');
    this.from =
      config.get<string>('MAIL_FROM') ??
      config.get<string>('SMTP_FROM') ??
      user ??
      '';
    this.replyTo = config.get<string>('MAIL_REPLY_TO') || undefined;
    this.minIntervalMs = Number(
      config.get<string>('MAIL_MIN_INTERVAL_MS') ?? DEFAULT_MIN_INTERVAL_MS,
    );

    const resendApiKey = config.get<string>('RESEND_API_KEY');
    if (resendApiKey) {
      this.resendApiKey = resendApiKey;
      this.logger.log('Envio de e-mail via API do Resend');
      return;
    }

    const host = config.get<string>('SMTP_HOST');
    const pass = config.get<string>('SMTP_PASS');
    const port = Number(config.get<string>('SMTP_PORT') ?? 587);

    if (!host || !user || !pass) {
      this.logger.warn(
        'E-mail não configurado (RESEND_API_KEY ou SMTP_HOST, SMTP_USER, SMTP_PASS). E-mails não serão enviados.',
      );
      return;
    }

    this.transporter = createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 30_000,
    });
    this.logger.log(`Envio de e-mail via SMTP (${host}:${port})`);
  }

  public isConfigured(): boolean {
    return this.resendApiKey !== null || this.transporter !== null;
  }

  public send(params: SendMailParams): Promise<string | null> {
    const job = this.queue.then(async () => {
      const wait = this.lastSentAt + this.minIntervalMs - Date.now();
      if (wait > 0) await sleep(wait);
      try {
        const providerId = await this.deliver(params);
        await this.record(params, EmailStatusEnum.SENT, providerId);
        return providerId;
      } catch (e: any) {
        await this.record(params, EmailStatusEnum.FAILED, null, e?.message);
        throw e;
      } finally {
        this.lastSentAt = Date.now();
      }
    });
    this.queue = job.catch(() => undefined);
    return job;
  }

  private async record(
    params: SendMailParams,
    status: EmailStatusEnum,
    providerId: string | null,
    error?: string,
  ) {
    try {
      await EmailLogEntity.create({
        providerId,
        toEmail: params.to.slice(0, 255),
        subject: params.subject.slice(0, 255),
        category: params.log?.category ?? EmailCategoryEnum.OTHER,
        status,
        clientId: params.log?.clientId ?? null,
        sentBy: params.log?.sentBy ?? null,
        error: error?.slice(0, 500) ?? null,
      }).save();
    } catch (e: any) {
      this.logger.error(`Falha ao registrar o e-mail enviado: ${e.message}`);
    }
  }

  private async deliver(params: SendMailParams): Promise<string | null> {
    if (this.resendApiKey) {
      return this.sendWithResend(this.resendApiKey, params);
    }

    if (!this.transporter) {
      throw new Error('Envio de e-mail não configurado no servidor');
    }

    await this.transporter.sendMail({
      from: this.from,
      replyTo: params.replyTo ?? this.replyTo,
      to: params.to,
      subject: params.subject,
      html: params.html,
      attachments: params.attachments,
    });
    return null;
  }

  private async sendWithResend(
    apiKey: string,
    { to, subject, html, replyTo, attachments }: SendMailParams,
  ): Promise<string | null> {
    const files = attachments?.length
      ? await Promise.all(
          attachments.map(async (file) => ({
            filename: file.filename,
            content: (await fs.readFile(file.path)).toString('base64'),
          })),
        )
      : undefined;

    const response = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: this.from,
        to: [to],
        reply_to: replyTo ?? this.replyTo,
        subject,
        html,
        attachments: files,
      }),
      signal: AbortSignal.timeout(RESEND_TIMEOUT_MS),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Resend respondeu ${response.status}: ${detail}`);
    }

    const body = (await response.json().catch(() => null)) as {
      id?: string;
    } | null;
    return body?.id ?? null;
  }
}
