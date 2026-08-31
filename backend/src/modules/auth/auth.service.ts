import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ClientEntity } from 'src/entities/client.entity';
import { UserEntity } from 'src/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

    async validateUser(cpf: string, password: string) {
        const usuarioExistente = await UserEntity.findOne({ where: { cpf } });

        const hashParaComparar = usuarioExistente?.password ?? '$2b$10$invalidHashInvalidHashInvalidHas';
        const senhaValida = await bcrypt.compare(password, hashParaComparar);

        if (!usuarioExistente || !senhaValida) {
            throw new UnauthorizedException('Cpf ou senha inválidos');
        }

        return { id: usuarioExistente.id, info: usuarioExistente.cpf };
    }

    async validateClient(cnpj: string, password: string) {
        const clienteExistente = await ClientEntity.findOne({ where: { cnpj } });

        const hashParaComparar = clienteExistente?.password ?? '$2b$10$invalidHashInvalidHashInvalidHas';
        const senhaValida = await bcrypt.compare(password, hashParaComparar);

        if (!clienteExistente || !senhaValida) {
            throw new UnauthorizedException('Cnpj ou senha inválidos');
        }

        return { id: clienteExistente.id, info: clienteExistente.cnpj };
    }

    async login(user: { id: string; info: string }) {
        const payload = { sub: user.id, info: user.info };
        return { access_token: this.jwtService.sign(payload) };
    }
}