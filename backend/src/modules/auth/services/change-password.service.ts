import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserEntity } from "src/entities/user.entity";
import * as bcrypt from "bcrypt";

@Injectable()
export class ChangePasswordService {
  constructor(private readonly jwtService: JwtService) {}

  public async execute(token: string, newPassword: string) {
    let payload: { sub: string; email: string };

    if(newPassword.length < 6) {
        throw new BadRequestException('Senha precisa ter pelo menos 6 caracteres.')
    }

    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException("Token inválido ou expirado.");
    }

    const existingUser = await UserEntity.findOne({ where: { id: payload.sub } });

    if (!existingUser) {
      throw new NotFoundException("Usuário não encontrado.");
    }

    const saltRounds = 10;
    existingUser.password = await bcrypt.hash(newPassword, saltRounds);
    existingUser.updatedAt = new Date();

    await existingUser.save();

    return { message: "Senha alterada com sucesso." };
  }
}