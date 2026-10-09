import { InternalServerErrorException } from '@nestjs/common';
import { ClientEntity } from 'src/entities/client.entity';

export class ListClientsService {
  public async execute(): Promise<Object[]> {
    try {
      const clients = await ClientEntity.createQueryBuilder('client').getMany();

      if (clients == null || clients.length == 0) {
        return [];
      }

      return clients;
    } catch (e: any) {
      throw new InternalServerErrorException(
        'Não foi possível buscar os clientes.',
      );
    }
  }
}
