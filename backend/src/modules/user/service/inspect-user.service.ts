import { UserEntity } from 'src/entities/user.entity';

export class InspectUserService {
  public async execute(id: string) {
    if (!id) {
      throw new Error('ID do usuário não fornecido');
    }

    const user = await UserEntity.createQueryBuilder('user')
      .leftJoinAndSelect('user.userClients', 'userClient')
      .leftJoinAndSelect('userClient.client', 'client')
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      cpf: user.cpf,
      phone: user.phone,
      clients: (user.userClients ?? [])
        .filter((userClient) => userClient.client)
        .map((userClient) => ({
          id: userClient.client.id,
          name: userClient.client.name,
        })),
    };
  }
}
