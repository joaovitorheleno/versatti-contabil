import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor(config: ConfigService) {
    const host = config.get<string>('SMTP_HOST');
    const user = config.get<string>('SMTP_USER');
    const pass = config.get<string>('SMTP_PASS');
    const port = Number(config.get<string>('SMTP_PORT') ?? 587);

    this.from = config.get<string>('SMTP_FROM') ?? user ?? '';

    if (!host || !user || !pass) {
      this.logger.warn(
        'SMTP não configurado (SMTP_HOST, SMTP_USER, SMTP_PASS). E-mails não serão enviados.',
      );
      this.transporter = null;
      return;
    }

    this.transporter = createTransport({
      host,
      port,
      // 465 usa TLS direto; 587 usa STARTTLS
      secure: port === 465,
      auth: { user, pass },
    });
  }

  public isConfigured(): boolean {
    return this.transporter !== null;
  }

  public async send({ to, subject, html, attachments }: SendMailParams) {
    if (!this.transporter) {
      throw new Error('Envio de e-mail não configurado no servidor');
    }

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      html,
      attachments,
    });
  }
}
