import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { ClientEntity } from 'src/entities/client.entity';
import { CreateClientDto } from '../dto/create-client.dto';

@Injectable()
export class CreateClientService {
  public async execute(clientData: CreateClientDto) {
    const { name, cnpj, taxRegime } = clientData;

    const cleanCnpj = cnpj.replace(/\D/g, '');

    const existingClient = await ClientEntity.findOne({
      where: { cnpj: cleanCnpj },
    });
    if (existingClient) {
      throw new ConflictException('CNPJ já cadastrado');
    }

    if (cleanCnpj.length !== 14) {
      throw new BadRequestException('O CNPJ inválido.');
    }

    const client = new ClientEntity();
    client.name = name;

    client.cnpj = cleanCnpj;

    client.taxRegime = taxRegime;
    client.createdAt = new Date();

    const savedClient = await client.save();

    return savedClient;
  }
}
