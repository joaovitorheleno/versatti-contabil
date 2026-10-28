import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientEntity } from 'src/entities/client.entity';
import { UserClientEntity } from 'src/entities/user-client.entity';

@Injectable()
export class ListClientUsersService {
  public async execute(clientId: string) {
    const client = await ClientEntity.findOne({ where: { id: clientId } });
    if (!client) throw new NotFoundException('Empresa não encontrada');

    const links = await UserClientEntity.find({
      where: { client: { id: clientId } },
      relations: { user: true },
    });

    return links
      .filter((link) => link.user?.email)
      .map((link) => ({
        id: link.user.id,
        name: link.user.name,
        email: link.user.email,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
