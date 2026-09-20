import { InternalServerErrorException } from '@nestjs/common';
import { ClientEntity } from 'src/entities/client.entity';

export class ListClientsService {
  public async execute(): Promise<Object[]> {
    try {
      const clients = await ClientEntity.createQueryBuilder('client')
        .select(['client.id', 'client.name', 'client.cnpj', 'client.taxRegime'])
        .getMany();

      if (clients == null || clients.length == 0) {
        return [];
      }

      const mappedClients = clients.map((client) => {
        return {
          id: client.id,
          name: client.name,
          cnpj: client.cnpj,
          taxRegime: client.taxRegime,
        };
      });

      return mappedClients;
    } catch (e: any) {
      throw new InternalServerErrorException(
        'Não foi possível buscar os clientes.',
      );
    }
  }
}
