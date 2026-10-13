import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { TaxRegimeEnum } from 'src/enum/tax-regime.enum';

export class CreateClientDto {
  @IsString({ message: 'A razão social deve ser uma string' })
  @IsNotEmpty({ message: 'A razão social é obrigatória' })
  @ApiProperty({
    description: 'Razão Social do Cliente/Empresa',
    example: 'Empresa Teste LTDA',
  })
  name!: string;

  @IsString({ message: 'O nome fantasia deve ser uma string' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Nome Fantasia do Cliente/Empresa',
    example: 'Tech Solutions',
  })
  tradeName?: string | undefined;

  @IsString({ message: 'O CNPJ deve ser uma string' })
  @IsNotEmpty({ message: 'O CNPJ é obrigatório' })
  @Length(14, 14, { message: 'O CNPJ deve conter exatamente 14 dígitos' })
  @ApiProperty({
    description: 'CNPJ do Cliente/Empresa (somente números)',
    example: '12345678000190',
  })
  cnpj!: string;

  @IsEnum(TaxRegimeEnum, { message: 'Regime tributário inválido' })
  @IsNotEmpty({ message: 'O regime tributário é obrigatório' })
  @ApiProperty({
    description: 'Regime Tributário do Cliente/Empresa',
    enum: TaxRegimeEnum,
    example: TaxRegimeEnum.SIMPLES_NACIONAL,
  })
  taxRegime!: TaxRegimeEnum;

  @IsNumber({}, { message: 'A inscrição estadual deve ser um número' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Inscrição Estadual (ou ISENTO)',
    example: '123456789',
  })
  stateRegistration?: string | undefined;

  @IsNumber({}, { message: 'A inscrição municipal deve ser um número' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Inscrição Municipal (para serviços)',
    example: '987654',
  })
  municipalRegistration?: string | undefined;

  @IsEmail({}, { message: 'E-mail fiscal inválido' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'E-mail para envio de XML/NFe',
    example: 'fiscal@empresateste.com.br',
  })
  nfeEmail?: string | undefined;

  @IsString({ message: 'O telefone deve ser uma string' })
  @IsNotEmpty({ message: 'O telefone é obrigatório' })
  @ApiProperty({
    description: 'Telefone de contato',
    example: '31999998888',
  })
  phone!: string;

  @IsString({ message: 'O nome do contato deve ser uma string' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Nome do responsável ou ponto de contato',
    example: 'João Silva',
  })
  contactPerson?: string | undefined;

  @IsString()
  @IsNotEmpty({ message: 'O CEP é obrigatório' })
  @Length(8, 8, { message: 'O CEP deve ter 8 dígitos' })
  @ApiProperty({ description: 'CEP (somente números)', example: '30100000' })
  zipCode!: string;

  @IsString()
  @IsNotEmpty({ message: 'O logradouro é obrigatório' })
  @ApiProperty({ description: 'Rua / Avenida', example: 'Av. Afonso Pena' })
  street!: string;

  @IsString()
  @IsNotEmpty({ message: 'O número é obrigatório' })
  @ApiProperty({ description: 'Número do endereço', example: '1500' })
  number!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Complemento', example: 'Sala 402' })
  complement?: string | undefined;

  @IsString()
  @IsNotEmpty({ message: 'O bairro é obrigatório' })
  @ApiProperty({ description: 'Bairro', example: 'Centro' })
  neighborhood!: string;

  @IsString()
  @IsNotEmpty({ message: 'A cidade é obrigatória' })
  @ApiProperty({ description: 'Cidade', example: 'Belo Horizonte' })
  city!: string;

  @IsString()
  @Length(2, 2, { message: 'O estado deve ser a sigla com 2 letras' })
  @IsNotEmpty({ message: 'O estado é obrigatório' })
  @ApiProperty({ description: 'UF', example: 'MG' })
  state!: string;

  @IsBoolean()
  @IsNotEmpty({ message: 'O campo ativo é obrigatório' })
  @ApiPropertyOptional({
    description: 'Indica se o cliente está ativo no sistema',
    default: true,
  })
  isActive!: boolean;
}
