import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { createTransport, type Transporter } from 'nodemailer';

export interface MailAttachment {
  filename: string;
  path: string;
  contentType?: string;
}

export interface SendMailParams {
  to: string;
  subject: string;
  html: string;
  attachments?: MailAttachment[];
}

const RESEND_URL = 'https://api.resend.com/emails';
const RESEND_TIMEOUT_MS = 30_000;

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null = null;
  private readonly resendApiKey: string | null = null;
  private readonly from: string;
  private readonly replyTo: string | undefined;

  constructor(config: ConfigService) {
    const user = config.get<string>('SMTP_USER');
    this.from =
      config.get<string>('MAIL_FROM') ??
      config.get<string>('SMTP_FROM') ??
      user ??
      '';
    this.replyTo = config.get<string>('MAIL_REPLY_TO') || undefined;

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

  public async send(params: SendMailParams) {
    if (this.resendApiKey) {
      return this.sendWithResend(this.resendApiKey, params);
    }

    if (!this.transporter) {
      throw new Error('Envio de e-mail não configurado no servidor');
    }

    await this.transporter.sendMail({
      from: this.from,
      replyTo: this.replyTo,
      to: params.to,
      subject: params.subject,
      html: params.html,
      attachments: params.attachments,
    });
  }

  private async sendWithResend(
    apiKey: string,
    { to, subject, html, attachments }: SendMailParams,
  ) {
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
        reply_to: this.replyTo,
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
  }
}
