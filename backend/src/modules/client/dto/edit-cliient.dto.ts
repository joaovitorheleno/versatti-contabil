import { ApiPropertyOptional } from '@nestjs/swagger';
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
  stateRegistration?: string;

  @IsString({ message: 'A inscrição municipal deve ser uma string' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Inscrição Municipal (para serviços)',
    example: '987654',
  })
  municipalRegistration?: string;

  @IsEmail({}, { message: 'E-mail inválido' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'E-mail principal para contato/financeiro',
    example: 'financeiro@empresateste.com.br',
  })
  email?: string;

  @IsEmail({}, { message: 'E-mail fiscal inválido' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'E-mail para envio de XML/NFe',
    example: 'fiscal@empresateste.com.br',
  })
  nfeEmail?: string;

  @IsString({ message: 'O telefone deve ser uma string' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Telefone de contato',
    example: '31999998888',
  })
  phone?: string;

  @IsString({ message: 'O nome do contato deve ser uma string' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Nome do responsável ou ponto de contato',
    example: 'João Silva',
  })
  contactPerson?: string;

  @IsString()
  @IsOptional()
  @Length(8, 8, { message: 'O CEP deve ter 8 dígitos' })
  @ApiPropertyOptional({ description: 'CEP (somente números)', example: '30100000' })
  zipCode?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Rua / Avenida', example: 'Av. Afonso Pena' })
  street?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Número do endereço', example: '1500' })
  number?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Complemento', example: 'Sala 402' })
  complement?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Bairro', example: 'Centro' })
  neighborhood?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Cidade', example: 'Belo Horizonte' })
  city?: string;

  @IsString()
  @IsOptional()
  @Length(2, 2, { message: 'O estado deve ser a sigla com 2 letras' })
  @ApiPropertyOptional({ description: 'UF', example: 'MG' })
  state?: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Indica se o cliente está ativo no sistema',
  })
  isActive?: boolean;
}