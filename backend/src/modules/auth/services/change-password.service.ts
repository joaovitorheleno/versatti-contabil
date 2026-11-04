import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UserEntity } from "src/entities/user.entity";
import * as bcrypt from "bcrypt";
import { PASSWORD_RESET_PURPOSE, passwordResetSecret } from "./recover-password.service";

@Injectable()
export class ChangePasswordService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  public async execute(token: string, newPassword: string) {
    if (typeof newPassword !== "string" || newPassword.length < 6) {
      throw new BadRequestException('Senha precisa ter pelo menos 6 caracteres.')
    }

    const invalid = new UnauthorizedException("Link inválido ou expirado. Solicite uma nova recuperação de senha.");
    const decoded = typeof token === "string" ? this.jwtService.decode(token) : null;
    if (!decoded?.sub || decoded.purpose !== PASSWORD_RESET_PURPOSE) throw invalid;

    const existingUser = await UserEntity.findOne({ where: { id: decoded.sub } });
    if (!existingUser?.password) throw invalid;

    try {
      await this.jwtService.verifyAsync(token, {
        secret: passwordResetSecret(this.config.get<string>("JWT_SECRET")!, existingUser.password),
      });
    } catch {
      throw invalid;
    }

    const saltRounds = 10;
    existingUser.password = await bcrypt.hash(newPassword, saltRounds);
    existingUser.updatedAt = new Date();

    await existingUser.save();

    return { message: "Senha alterada com sucesso." };
  }
}
