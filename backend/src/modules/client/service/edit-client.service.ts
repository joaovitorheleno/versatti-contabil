import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientEntity } from 'src/entities/client.entity';
import { EditClientDto } from '../dto/edit-cliient.dto';

@Injectable()
export class EditClientService {
  public async execute(
    id: string,
    editClientDto: EditClientDto,
    currentUserId: string,
  ): Promise<ClientEntity> {
    if (!id) {
      throw new BadRequestException('ID é obrigatório para atualização.');
    }

    const client = await ClientEntity.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    const { cnpj, ...otherData } = editClientDto;

    if (cnpj !== undefined) {
      const cleanCnpj = cnpj.replace(/\D/g, '');
      if (cleanCnpj.length !== 14) {
        throw new BadRequestException('CNPJ inválido. Deve conter 14 dígitos.');
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

    client.updatedBy = currentUserId;

    Object.assign(client, otherData);

    return await client.save();
  }
}
