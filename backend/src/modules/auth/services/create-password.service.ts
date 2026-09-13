import { BadRequestException, Injectable } from '@nestjs/common';
import { ValidateCpfResponse } from 'src/common/types/service-types';
import { UserEntity } from 'src/entities/user.entity';
import * as bcrypt from "bcrypt";

@Injectable()
export class CreatePasswordService {
  public async execute(password: string, cpfInput: string | { cpf: string }): Promise<ValidateCpfResponse> {
    if (!password) {
      throw new BadRequestException('Senha não fornecida.');
    }

    if(password.length < 6) {
      throw new BadRequestException('Senha precisa ter pelo menos 6 caracteres.');
    }

    const cpfString = typeof cpfInput === 'object' ? cpfInput?.cpf : cpfInput;
    const saltRounds = 10;

    if (!cpfString || typeof cpfString !== 'string') {
      throw new BadRequestException('CPF não fornecido ou inválido.');
    }

    const cleanCpf = cpfString.replace(/\D/g, '');

    const user = await UserEntity.findOne({ where: { cpf: cleanCpf } });
    if (!user) {
      throw new BadRequestException('Usuário não encontrado.');
    }

    if(user.password !== null) {
      throw new BadRequestException('Senha já cadastrada para este usuário.');
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    user.password = hashedPassword;
    await user.save();

    return { id: user.id, info: user.cpf };
  }
}