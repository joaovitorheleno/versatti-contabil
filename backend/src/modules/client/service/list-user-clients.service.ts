import { Injectable } from '@nestjs/common';
import { ClientEntity } from 'src/entities/client.entity';

@Injectable()
export class ListUserClientsService {
  public async execute(userId: string): Promise<Object[]> {
    if (!userId) {
      throw new Error('ID do usuário não fornecido');
    }

    try {
      const userClients = await ClientEntity.createQueryBuilder('client')
        .leftJoinAndSelect('client.userClients', 'uc')
        .where('uc.user = :userId', { userId })
        .select([
          'client.id',
          'client.name',
          'client.cnpj',
          'client.createdAt',
          'client.updatedAt',
          'client.tradeName',
          'client.taxRegime',
          'client.stateRegistration',
          'client.municipalRegistration',
          'client.nfeEmail',
          'client.responsibleEmail',
          'client.phone',
          'client.contactPerson',
          'client.zipCode',
          'client.street',
          'client.number',
          'client.complement',
          'client.neighborhood',
          'client.city',
          'client.state',
        ])
        .getMany();

      if (userClients == null || userClients.length == 0) {
        return [];
      }

      return userClients;
    } catch (e: any) {
      throw new Error(
        'Não foi possível buscar os clientes do usuário, erro: ' + e.message,
      );
    }
  }
}
