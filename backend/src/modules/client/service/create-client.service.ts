import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientEntity } from 'src/entities/client.entity';
import { CreateClientDto } from '../dto/create-client.dto';

interface BrasilApiCnpjResponse {
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  ddd_telefone_1?: string;
  email?: string;
}

interface BrasilApiCepResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
}

@Injectable()
export class CreateClientService {
  constructor(private readonly httpService: HttpService) {}

  public async execute(clientData: CreateClientDto, currentUserId: string) {
    const { cnpj } = clientData;

    const cleanCnpj = cnpj.replace(/\D/g, '');

    if (cleanCnpj.length !== 14) {
      throw new BadRequestException('CNPJ inválido. Deve conter 14 dígitos.');
    }

    const existingClient = await ClientEntity.createQueryBuilder('client')
      .where('client.cnpj = :cnpj', { cnpj: cleanCnpj })
      .getOne();

    if (existingClient) {
      throw new ConflictException('CNPJ já cadastrado no sistema.');
    }

    let companyData: BrasilApiCnpjResponse | null = null;
    try {
      const response = await firstValueFrom(
        this.httpService.get<BrasilApiCnpjResponse>(
          `https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`,
        ),
      );
      companyData = response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new BadRequestException(
          'CNPJ não encontrado na Receita Federal.',
        );
      }
      throw new InternalServerErrorException(
        'Erro ao consultar os dados do CNPJ na API externa.',
      );
    }

    const targetZipCode = (
      clientData.zipCode ||
      companyData?.cep ||
      ''
    ).replace(/\D/g, '');
    let cepData: BrasilApiCepResponse | null = null;

    if (
      targetZipCode.length === 8 &&
      (!companyData?.logradouro || clientData.zipCode)
    ) {
      try {
        const responseCep = await firstValueFrom(
          this.httpService.get<BrasilApiCepResponse>(
            `https://brasilapi.com.br/api/cep/v1/${targetZipCode}`,
          ),
        );
        cepData = responseCep.data;
      } catch {}
    }

    if (!clientData.municipalRegistration && !clientData.stateRegistration) {
      throw new BadRequestException(
        'Registro municipal e registro estadual não podem ficar vazios, preencha ao menos 1 dos campos.',
      );
    }

    const client = new ClientEntity();

    client.name = clientData.name || companyData?.razao_social || '';
    client.tradeName = clientData.tradeName || companyData?.nome_fantasia || '';
    client.cnpj = cleanCnpj;

    client.taxRegime = clientData.taxRegime;
    client.stateRegistration = clientData.stateRegistration;
    client.municipalRegistration = clientData.municipalRegistration;

    client.nfeEmail = clientData.nfeEmail || companyData?.email;
    client.phone = clientData.phone || companyData?.ddd_telefone_1 || '';
    client.contactPerson = clientData.contactPerson;

    client.zipCode = targetZipCode;
    client.street =
      clientData.street || cepData?.street || companyData?.logradouro || '';
    client.number = clientData.number || companyData?.numero || '';
    client.complement = clientData.complement || companyData?.complemento;
    client.neighborhood =
      clientData.neighborhood ||
      cepData?.neighborhood ||
      companyData?.bairro ||
      '';
    client.city =
      clientData.city || cepData?.city || companyData?.municipio || '';
    client.state = clientData.state || cepData?.state || companyData?.uf || '';

    client.isActive = clientData.isActive ?? true;
    client.createdBy = currentUserId;

    try {
      const savedClient = await client.save();
      return savedClient;
    } catch (error: any) {
      throw new InternalServerErrorException(
        'Erro ao cadastrar o cliente.',
        error.message,
      );
    }
  }
}
