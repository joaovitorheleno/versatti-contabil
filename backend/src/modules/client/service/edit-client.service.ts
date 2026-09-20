import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { EditClientDto } from '../dto/edit-cliient.dto';
import { ClientEntity } from 'src/entities/client.entity';

@Injectable()
export class EditClientService {
  public async execute(
    id: string,
    newClient: EditClientDto,
  ): Promise<ClientEntity> {
    if (!id) {
      throw new BadRequestException('ID não encontrado.');
    }

    const client = await ClientEntity.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    const { name, cnpj, taxRegime } = newClient;

    if (cnpj !== undefined) {
      const cleanCnpj = cnpj.replace(/\D/g, '');
      if (cleanCnpj.length !== 14) {
        throw new BadRequestException('CNPJ inválido.');
      }

      const existingClientWithCnpj = await ClientEntity.createQueryBuilder(
        'client',
      )
        .where('client.cnpj = :cnpj', { cnpj: cleanCnpj })
        .andWhere('client.id <> :id', { id })
        .getOne();

      if (existingClientWithCnpj) {
        throw new ConflictException('CNPJ já cadastrado para outra empresa.');
      }

      client.cnpj = cleanCnpj;
    }

    if (name !== undefined) {
      client.name = name;
    }

    if (taxRegime !== undefined) {
      client.taxRegime = taxRegime;
    }

    return await client.save();
  }
}
