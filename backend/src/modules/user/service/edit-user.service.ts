import { BadRequestException } from '@nestjs/common';
import { In } from 'typeorm';
import { EditUserDto } from '../dto/edit-user.dto';
import { UserEntity } from 'src/entities/user.entity';
import { ClientEntity } from 'src/entities/client.entity';
import { UserClientEntity } from 'src/entities/user-client.entity';

export class EditUserService {
  public async execute(
    id: string,
    editUserDto: EditUserDto,
    currentUserId: string,
  ): Promise<UserEntity> {
    if (!id) {
      throw new BadRequestException('ID é obrigatório para atualização.');
    }

    const { name, email, cpf, phone, clientIds } = editUserDto;

    if (email !== undefined && email.trim() !== '') {
      const cleanEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(cleanEmail)) {
        throw new BadRequestException('Email inválido.');
      }

      const existingUser = await UserEntity.createQueryBuilder('user')
        .where('user.email = :email', { email: cleanEmail })
        .andWhere('user.id <> :id', { id })
        .getOne();

      if (existingUser) {
        throw new BadRequestException('Email já cadastrado.');
      }
    }

    if (cpf !== undefined && cpf.trim() !== '') {
      const cleanCpf = cpf.replace(/\D/g, '');

      if (cleanCpf.length !== 11) {
        throw new BadRequestException('CPF inválido. Deve conter 11 dígitos.');
      }

      const existingUserWithCpf = await UserEntity.createQueryBuilder('user')
        .where('user.cpf = :cpf', { cpf: cleanCpf })
        .andWhere('user.id <> :id', { id })
        .getOne();

      if (existingUserWithCpf) {
        throw new BadRequestException('CPF já cadastrado.');
      }
    }

    if (phone !== undefined && phone.trim() !== '') {
      const cleanPhone = phone.replace(/\D/g, '');

      const existingUserWithPhone = await UserEntity.createQueryBuilder('user')
        .where('user.phone = :phone', { phone: cleanPhone })
        .andWhere('user.id <> :id', { id })
        .getOne();

      if (existingUserWithPhone) {
        throw new BadRequestException('Telefone já cadastrado.');
      }
    }

    const user = await UserEntity.findOne({ where: { id } });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado.');
    }

    let clients: ClientEntity[] | undefined;

    if (clientIds !== undefined) {
      const uniqueClientIds = [...new Set(clientIds)];

      clients = uniqueClientIds.length
        ? await ClientEntity.find({ where: { id: In(uniqueClientIds) } })
        : [];

      if (clients.length !== uniqueClientIds.length) {
        throw new BadRequestException(
          'Uma ou mais empresas informadas não foram encontradas.',
        );
      }
    }

    user.updatedBy = currentUserId;

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email.trim().toLowerCase();
    if (cpf !== undefined) user.cpf = cpf.replace(/\D/g, '');
    if (phone !== undefined) user.phone = phone.replace(/\D/g, '');

    return await UserEntity.getRepository().manager.transaction(
      async (manager) => {
        const savedUser = await manager.save(user);

        if (clients !== undefined) {
          const currentLinks = await manager.find(UserClientEntity, {
            where: { user: { id } },
            relations: { client: true },
          });

          const newIds = new Set(clients.map((c) => c.id));
          const currentIds = new Set(
            currentLinks.filter((l) => l.client).map((l) => l.client.id),
          );

          const toRemove = currentLinks.filter(
            (l) => !l.client || !newIds.has(l.client.id),
          );

          const toAdd = clients
            .filter((c) => !currentIds.has(c.id))
            .map((client) => {
              const userClient = new UserClientEntity();
              userClient.user = savedUser;
              userClient.client = client;
              userClient.createdBy = currentUserId;
              return userClient;
            });

          if (toRemove.length) await manager.remove(toRemove);
          if (toAdd.length) await manager.save(toAdd);
        }

        return savedUser;
      },
    );
  }
}
