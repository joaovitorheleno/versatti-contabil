import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { In } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserEntity } from 'src/entities/user.entity';
import { ClientEntity } from 'src/entities/client.entity';
import { UserClientEntity } from 'src/entities/user-client.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CreateUserService {
  public async execute(userData: CreateUserDto, currentUserId: string) {
    const {
      name,
      email,
      cpf,
      phone,
      password,
      clientIds = [],
    } = userData;

    const cleanCpf = cpf.replace(/\D/g, '');
    const cleanEmail = email?.trim().toLowerCase();
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';

    const existingUser = await UserEntity.findOne({
      where: [
        { cpf: cleanCpf },
        { email: cleanEmail },
        ...(cleanPhone ? [{ phone: cleanPhone }] : []),
      ],
    });

    if (existingUser) {
      if (existingUser.cpf === cleanCpf)
        throw new ConflictException('CPF já cadastrado');
      if (existingUser.email === cleanEmail)
        throw new ConflictException('Email já cadastrado');
      if (existingUser.phone === cleanPhone)
        throw new ConflictException('Telefone já cadastrado');
    }

    let clients: ClientEntity[] = [];
    if (clientIds.length > 0) {
      clients = await ClientEntity.findBy({ id: In(clientIds) });

      if (clients.length !== clientIds.length) {
        const foundIds = clients.map((c) => c.id);
        const missing = clientIds.filter((id) => !foundIds.includes(id));
        throw new BadRequestException(
          `Client(s) não encontrado(s): ${missing.join(', ')}`,
        );
      }
    }

    try {
      const user = new UserEntity();
      user.name = name;
      user.email = cleanEmail;
      user.cpf = cleanCpf;
      user.phone = cleanPhone;

      if (password) {
        const saltRounds = 10;
        user.password = await bcrypt.hash(password, saltRounds);
      }

      user.createdAt = new Date();
      user.createdBy = currentUserId;

      const savedUser = await user.save();

      if (clients.length > 0) {
        const clientUsers = clients.map((client) => {
          const userClient = new UserClientEntity();
          userClient.user = savedUser;
          userClient.client = client;
          userClient.createdBy = currentUserId;
          return userClient;
        });

        await UserClientEntity.save(clientUsers);
      }

      savedUser.createdBy = currentUserId;

      return savedUser;
    } catch (error) {
      throw new BadRequestException('Erro ao criar usuário.');
    }
  }
}
