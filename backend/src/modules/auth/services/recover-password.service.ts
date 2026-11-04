import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UserEntity } from "src/entities/user.entity";
import { EmailCategoryEnum } from "src/enum/email-log.enum";
import { escapeHtml, renderMailLayout } from "src/modules/mail/mail-layout";
import { MailService } from "src/modules/mail/mail.service";

export const PASSWORD_RESET_PURPOSE = "password-reset";

export const passwordResetSecret = (jwtSecret: string, passwordHash: string) =>
  `${jwtSecret}:${passwordHash}`;

const GENERIC_RESPONSE = {
  message: "Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.",
};

@Injectable()
export class RecoverPasswordService {
  private readonly logger = new Logger(RecoverPasswordService.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {
    const corsOrigin = (config.get<string>("CORS_ORIGINS") ?? "").split(",")[0]?.trim();
    this.frontendUrl = (config.get<string>("FRONTEND_URL") || corsOrigin || "http://localhost:5173").replace(/\/+$/, "");
  }

  public async execute(email: string) {
    const normalized = typeof email === "string" ? email.trim() : "";
    const user = normalized
      ? await UserEntity.createQueryBuilder("user")
          .where("LOWER(user.email) = LOWER(:email)", { email: normalized })
          .getOne()
      : null;

    if (user?.email && user.password) {
      this.sendResetEmail(user).catch((e) =>
        this.logger.error(`Falha ao enviar recuperação de senha: ${e?.message ?? e}`),
      );
    }

    return GENERIC_RESPONSE;
  }

  private async sendResetEmail(user: UserEntity) {
    const token = this.jwtService.sign(
      { sub: user.id, purpose: PASSWORD_RESET_PURPOSE },
      {
        expiresIn: "15m",
        secret: passwordResetSecret(this.config.get<string>("JWT_SECRET")!, user.password!),
      },
    );
    const link = `${this.frontendUrl}/resetPassword?token=${encodeURIComponent(token)}`;

    await this.mailService.send({
      to: user.email,
      subject: "Redefinição de senha - Versatti",
      html: renderMailLayout(
        "Redefinição de senha",
        `<p>Olá, ${escapeHtml(user.name ?? "")}.</p>
         <p>Recebemos um pedido para redefinir a sua senha. Clique no botão abaixo para criar uma nova:</p>
         <p><a href="${escapeHtml(link)}" style="display:inline-block;padding:10px 20px;background:#16302a;color:#ffffff;text-decoration:none;border-radius:4px;">Redefinir senha</a></p>
         <p style="color:#6b7a73;font-size:13px;">O link vale por 15 minutos e só pode ser usado uma vez. Se você não pediu a redefinição, ignore este e-mail.</p>`,
      ),
      log: { category: EmailCategoryEnum.PASSWORD_RESET, sentBy: null },
    });
  }
}
