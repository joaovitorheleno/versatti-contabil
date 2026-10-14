import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty({
    description: 'ID do cliente (empresa) ao qual o documento pertence',
    format: 'uuid',
    example: '9c6732aa-cd03-4425-8797-01367a56f264',
  })
  @IsUUID('4', { message: 'clientId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'O cliente é obrigatório' })
  clientId!: string;

  @ApiProperty({
    description: 'ID do tipo de documento',
    format: 'uuid',
    example: '3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  })
  @IsUUID('4', { message: 'documentTypeId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'O tipo de documento é obrigatório' })
  documentTypeId!: string;

  @ApiProperty({
    description: 'Título do documento',
    maxLength: 255,
    example: 'Alvará de Funcionamento 2026',
  })
  @IsString()
  @IsNotEmpty({ message: 'O título é obrigatório' })
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({
    description: 'Número/identificador do documento',
    maxLength: 100,
    example: 'ALV-2026/00123',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  number?: string;

  @ApiPropertyOptional({
    description: 'Observações sobre o documento',
    example: 'Renovação solicitada à prefeitura em setembro.',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Data de emissão (YYYY-MM-DD)',
    type: String,
    format: 'date',
    example: '2026-01-15',
  })
  @IsOptional()
  @IsDateString({}, { message: 'issueDate deve estar no formato YYYY-MM-DD' })
  issueDate?: string;

  @ApiPropertyOptional({
    description:
      'Data de vencimento (YYYY-MM-DD). Obrigatória quando o tipo de documento exige vencimento',
    type: String,
    format: 'date',
    example: '2027-01-15',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'expirationDate deve estar no formato YYYY-MM-DD' },
  )
  expirationDate?: string;

  @ApiPropertyOptional({
    description:
      'Quantos dias antes do vencimento enviar o alerta. Se omitido, usa o padrão do tipo de documento',
    type: Number,
    minimum: 0,
    example: 30,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'alertDays deve ser um número inteiro' })
  @Min(0)
  alertDays?: number;

  @ApiPropertyOptional({
    description: 'Se o documento fica visível para o cliente',
    type: Boolean,
    default: true,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  visibleToClient?: boolean;
}

export class CreateDocumentWithFileDto extends CreateDocumentDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Arquivo do documento (PDF, imagem, Word ou Excel, até 10 MB)',
  })
  file?: any;
}
