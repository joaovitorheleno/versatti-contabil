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

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_TIMEOUT_MS = 30_000;

const parseAddress = (value: string) => {
  const match = value.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  return match
    ? { name: match[1].trim() || undefined, email: match[2].trim() }
    : { name: undefined, email: value.trim() };
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null = null;
  private readonly brevoApiKey: string | null = null;
  private readonly from: string;

  constructor(config: ConfigService) {
    const user = config.get<string>('SMTP_USER');
    this.from =
      config.get<string>('MAIL_FROM') ??
      config.get<string>('SMTP_FROM') ??
      user ??
      '';

    const brevoApiKey = config.get<string>('BREVO_API_KEY');
    if (brevoApiKey) {
      this.brevoApiKey = brevoApiKey;
      this.logger.log('Envio de e-mail via API do Brevo');
      return;
    }

    const host = config.get<string>('SMTP_HOST');
    const pass = config.get<string>('SMTP_PASS');
    const port = Number(config.get<string>('SMTP_PORT') ?? 587);

    if (!host || !user || !pass) {
      this.logger.warn(
        'E-mail não configurado (BREVO_API_KEY ou SMTP_HOST, SMTP_USER, SMTP_PASS). E-mails não serão enviados.',
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
    return this.brevoApiKey !== null || this.transporter !== null;
  }

  public async send(params: SendMailParams) {
    if (this.brevoApiKey) {
      return this.sendWithBrevo(this.brevoApiKey, params);
    }

    if (!this.transporter) {
      throw new Error('Envio de e-mail não configurado no servidor');
    }

    await this.transporter.sendMail({
      from: this.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      attachments: params.attachments,
    });
  }

  private async sendWithBrevo(
    apiKey: string,
    { to, subject, html, attachments }: SendMailParams,
  ) {
    const sender = parseAddress(this.from);

    const attachment = attachments?.length
      ? await Promise.all(
          attachments.map(async (file) => ({
            name: file.filename,
            content: (await fs.readFile(file.path)).toString('base64'),
          })),
        )
      : undefined;

    const response = await fetch(BREVO_URL, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender,
        to: [{ email: to }],
        subject,
        htmlContent: html,
        attachment,
      }),
      signal: AbortSignal.timeout(BREVO_TIMEOUT_MS),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Brevo respondeu ${response.status}: ${detail}`);
    }
  }
}
