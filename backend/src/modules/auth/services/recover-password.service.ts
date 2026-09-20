import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/entities/user.entity';

@Injectable()
export class RecoverPasswordService {
  constructor(private readonly jwtService: JwtService) {}

  public async execute(email: string) {
    
    const existingUser = email ? await UserEntity.findOne({ where: { email } }) : null

    if (!existingUser) {
      throw new NotFoundException("Nenhum usuário foi encontrado para o e-mail inserido.");
    }

    if (existingUser.password === null) {
      throw new BadRequestException("Usuário não concluiu o primeiro acesso. Crie uma senha antes de recuperar.");
    }

    const resetToken = this.jwtService.sign(
      { sub: existingUser.id, email: existingUser.email },
      { expiresIn: '15m' }
    );

    return {
      email: existingUser.email,
      name: existingUser.name,
      resetToken,
    };
  }
}