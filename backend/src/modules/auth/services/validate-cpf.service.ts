import { BadRequestException, Injectable } from '@nestjs/common';
import { ValidateCpfResponse } from 'src/common/types/service-types';
import { findUserByLogin } from 'src/common/utils/find-user-by-login';

@Injectable()
export class ValidateCpfService {
  public async execute(cpfInput: string | { cpf: string }): Promise<ValidateCpfResponse> {
    const cpfString = typeof cpfInput === 'object' ? cpfInput?.cpf : cpfInput;

    if (!cpfString || typeof cpfString !== 'string') {
      throw new BadRequestException('CPF ou e-mail não fornecido.');
    }

    const usuarioExistente = await findUserByLogin(cpfString);

    if (!usuarioExistente) {
      throw new BadRequestException('CPF ou e-mail não encontrado');
    }

    if (usuarioExistente.password !== null) {
      throw new BadRequestException('Este usuário já tem senha cadastrada. Faça login.');
    }

    return { 
      id: usuarioExistente.id, 
      info: {
        name: usuarioExistente.name,
        cpf: usuarioExistente.cpf,
        phone: usuarioExistente.phone,
        email: usuarioExistente.email,
        role: usuarioExistente.role
      }
    };
  }
}