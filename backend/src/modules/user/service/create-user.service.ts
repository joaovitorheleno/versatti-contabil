import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { In } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserEntity } from 'src/entities/user.entity';
import { ClientEntity } from 'src/entities/client.entity';
import { UserClientEntity } from 'src/entities/user-client.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CreateUserService {
  private readonly logger = new Logger(CreateUserService.name);

  public async execute(userData: CreateUserDto, currentUserId: string) {
    const {
      name,
      email,
      cpf,
      phone,
      password,
      clientIds = [],
    } = userData;

    const cleanCpf = cpf?.replace(/\D/g, '');
    const cleanEmail = email?.trim().toLowerCase();
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';

    const existingUser = await UserEntity.findOne({
      where: [
        ...(cleanCpf ? [{ cpf: cleanCpf }] : []),
        { email: cleanEmail },
        ...(cleanPhone ? [{ phone: cleanPhone }] : []),
      ],
    });

    if (existingUser) {
      if (cleanCpf && existingUser.cpf === cleanCpf)
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
      user.cpf = cleanCpf || null;
      user.phone = cleanPhone || null;

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
    } catch (error: any) {
      if (error?.code === '23505') {
        const detail = String(error.detail ?? '');
        if (detail.includes('(cpf)')) throw new ConflictException('CPF já cadastrado');
        if (detail.includes('(email)')) throw new ConflictException('Email já cadastrado');
        if (detail.includes('(phone)')) throw new ConflictException('Telefone já cadastrado');
      }
      this.logger.error(`Falha ao criar usuário: ${error?.message ?? error}`);
      throw new BadRequestException('Erro ao criar usuário.');
    }
  }
}
