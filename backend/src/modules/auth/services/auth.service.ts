import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ValidateCpfResponse } from 'src/common/types/service-types';
import { ClientEntity } from 'src/entities/client.entity';
import { UserEntity } from 'src/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

    public async validateUser(cpf: string, password: string): Promise<ValidateCpfResponse> {
        const usuarioExistente = await UserEntity.findOne({ where: { cpf } });

        const hashParaComparar = usuarioExistente?.password ?? '$2b$10$invalidHashInvalidHashInvalidHas';
        const senhaValida = await bcrypt.compare(password, hashParaComparar);

        if (!usuarioExistente || !senhaValida) {
            throw new UnauthorizedException('Cpf ou senha inválidos');
        }

        return { 
            id: usuarioExistente.id, 
            info: {
                name: usuarioExistente.name,
                cpf: usuarioExistente.cpf,
                email: usuarioExistente.email,
                phone: usuarioExistente.phone,
                dateOfBirth: usuarioExistente.dateOfBirth
            } 
        };
    }

    async login(data: ValidateCpfResponse) {
        const payload = { sub: data.id, info: data.info };
        return { access_token: this.jwtService.sign(payload) };
    }
}