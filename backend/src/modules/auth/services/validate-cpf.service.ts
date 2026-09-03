import { BadRequestException, Injectable } from '@nestjs/common';
import { ValidateCpfResponse } from 'src/common/types/service-types';
import { UserEntity } from 'src/entities/user.entity';

@Injectable()
export class ValidateCpfService {
  public async execute(cpfInput: string | { cpf: string }): Promise<ValidateCpfResponse> {
    const cpfString = typeof cpfInput === 'object' ? cpfInput?.cpf : cpfInput;

    if (!cpfString || typeof cpfString !== 'string') {
      throw new BadRequestException('CPF não fornecido ou inválido.');
    }

    const cleanCpf = cpfString.replace(/\D/g, '');

    const usuarioExistente = await UserEntity.findOne({ where: { cpf: cleanCpf } });

    if (!usuarioExistente) {
      throw new BadRequestException('CPF inválido');
    }

    if (usuarioExistente.password !== null) {
      throw new BadRequestException('CPF já cadastrado');
    }

    return { id: usuarioExistente.id, info: usuarioExistente.cpf };
  }
}