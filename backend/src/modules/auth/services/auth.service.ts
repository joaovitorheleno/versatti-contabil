import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ValidateCpfResponse } from 'src/common/types/service-types';
import { ClientEntity } from 'src/entities/client.entity';
import { findUserByLogin } from 'src/common/utils/find-user-by-login';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

    public async validateUser(login: string, password: string): Promise<ValidateCpfResponse> {
        const usuarioExistente = await findUserByLogin(login);

        const hashParaComparar = usuarioExistente?.password ?? '$2b$10$invalidHashInvalidHashInvalidHas';
        const senhaValida = await bcrypt.compare(password, hashParaComparar);

        if (!usuarioExistente || !senhaValida) {
            throw new UnauthorizedException('CPF/e-mail ou senha inválidos');
        }

        return { 
            id: usuarioExistente.id, 
            info: {
                name: usuarioExistente.name,
                cpf: usuarioExistente.cpf,
                email: usuarioExistente.email,
                phone: usuarioExistente.phone,
                role: usuarioExistente.role
            } 
        };
    }

    async login(data: ValidateCpfResponse) {
        const payload = { sub: data.id, info: data.info };
        return { access_token: this.jwtService.sign(payload) };
    }
}