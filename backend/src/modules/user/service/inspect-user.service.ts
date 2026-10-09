import { ClientEntity } from 'src/entities/client.entity';
import { UserClientEntity } from 'src/entities/user-client.entity';
import { UserEntity } from 'src/entities/user.entity';

export class InspectUserService {
  public async execute(id: string) {
    if (!id) {
      throw new Error('ID do usuário não fornecido');
    }

    const existingUser = await UserEntity.exists({ where: { id } });

    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    const users = await UserEntity.createQueryBuilder('user')
      .leftJoinAndSelect('user.userClients', 'userClient')
      .leftJoinAndSelect('userClient.client', 'client')
      .where('user.id = :id', { id })
      .getOne();

    const formattedUser = {
      id: users?.id,
      name: users?.name,
      email: users?.email,
      createdAt: users?.createdAt,
      updatedAt: users?.updatedAt,
      cpf: users?.cpf,
      phone: users?.phone,
      dateOfBirth: users?.dateOfBirth,
      clients: users?.userClients?.map((userClient) => ({
        id: userClient.client.id,
        name: userClient.client.name,
      })),
    };

    return formattedUser;
  }
}
