import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

interface BrasilApiCepResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
}

@Injectable()
export class ConsultCepService {
  constructor(private readonly httpService: HttpService) {}

  public async execute(cep: string) {
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      throw new BadRequestException('CEP inválido. Deve conter 8 dígitos.');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<BrasilApiCepResponse>(
          `https://brasilapi.com.br/api/cep/v1/${cleanCep}`,
        ),
      );

      return {
        zipCode: response.data.cep,
        street: response.data.street,
        neighborhood: response.data.neighborhood,
        city: response.data.city,
        state: response.data.state,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new BadRequestException('CEP não encontrado.');
      }
      throw new InternalServerErrorException('Erro ao consultar CEP.');
    }
  }
}
