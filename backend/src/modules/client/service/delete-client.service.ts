import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ClientEntity } from 'src/entities/client.entity';

@Injectable()
export class DeleteClientService {
  public async execute(id: string, userId: string) {
    try {
      const existingClient = await ClientEntity.findOne({ where: { id } });

      if (!existingClient) {
        throw new NotFoundException('Cliente não encontrado');
      }

      existingClient.deletedBy = userId;

      const deletedClient = await existingClient.softRemove();

      return deletedClient;
    } catch (e: any) {
      if (e instanceof HttpException) {
        throw e;
      }

      throw new InternalServerErrorException(
        e.message || 'Erro ao deletar cliente',
      );
    }
  }
}
