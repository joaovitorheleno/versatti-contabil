import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { TaxRegimeEnum } from 'src/enum/tax-regime.enum';

export class EditClientDto {
  @IsString({ message: 'A razão social deve ser uma string' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Razão Social do Cliente/Empresa',
    example: 'Empresa Teste LTDA',
  })
  name?: string;

  @IsString({ message: 'O nome fantasia deve ser uma string' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Nome Fantasia do Cliente/Empresa',
    example: 'Tech Solutions',
  })
  tradeName?: string;

  @IsString({ message: 'O CNPJ deve ser uma string' })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @Length(14, 14, { message: 'O CNPJ deve conter exatamente 14 dígitos' })
  @ApiPropertyOptional({
    description: 'CNPJ do Cliente/Empresa (somente números)',
    example: '12345678000190',
  })
  cnpj?: string;

  @IsEnum(TaxRegimeEnum, { message: 'Regime tributário inválido' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Regime Tributário do Cliente/Empresa',
    enum: TaxRegimeEnum,
    example: TaxRegimeEnum.SIMPLES_NACIONAL,
  })
  taxRegime?: TaxRegimeEnum;

  @IsString({ message: 'A inscrição estadual deve ser uma string' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Inscrição Estadual (ou ISENTO)',
    example: '123456789',
  })
  stateRegistration?: string | undefined;

  @IsString({ message: 'A inscrição municipal deve ser uma string' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Inscrição Municipal (para serviços)',
    example: '987654',
  })
  municipalRegistration?: string;

  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsEmail({}, { message: 'E-mail fiscal inválido' })
  @IsOptional()
  nfeEmail?: string | undefined;

  // '' vira null para permitir apagar o e-mail na edição
  @Transform(({ value }) => (value === '' ? null : value))
  @IsEmail({}, { message: 'E-mail do responsável inválido' })
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'E-mail do responsável pela empresa. Recebe os documentos enviados pelo escritório',
    example: 'responsavel@empresateste.com.br',
  })
  responsibleEmail?: string | null;

  @IsString({ message: 'O telefone deve ser uma string' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Telefone de contato',
    example: '31999998888',
  })
  phone?: string | undefined;

  @IsString({ message: 'O nome do contato deve ser uma string' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Nome do responsável ou ponto de contato',
    example: 'João Silva',
  })
  contactPerson?: string | undefined;

  // @IsBoolean()
  // @IsOptional()
  // @ApiPropertyOptional({
  //   description: 'Indica se o cliente está ativo no sistema',
  // })
  // isActive?: boolean;
}
