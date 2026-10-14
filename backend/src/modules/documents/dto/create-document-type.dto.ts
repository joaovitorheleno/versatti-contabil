import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { DocumentTypeEnum } from '../../../enum/document-type.enum';
import { DocumentCategoryEnum } from 'src/enum/document-category.enum';

export class CreateDocumentTypeDto {
  @ApiProperty({
    description: 'Código único do tipo de documento',
    enum: DocumentTypeEnum,
    example: Object.values(DocumentTypeEnum)[0],
  })
  @IsEnum(DocumentTypeEnum, { message: 'Código de tipo de documento inválido' })
  code!: DocumentTypeEnum;

  @ApiProperty({
    description: 'Nome de exibição do tipo',
    maxLength: 100,
    example: 'Alvará de Funcionamento',
  })
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'Categoria do tipo de documento',
    enum: DocumentTypeEnum,
    example: Object.values(DocumentTypeEnum)[0],
  })
  @IsEnum(DocumentCategoryEnum, { message: 'Categoria inválida' })
  category!: DocumentCategoryEnum;

  @ApiPropertyOptional({
    description: 'Se documentos deste tipo exigem data de vencimento',
    default: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  requiresExpiration?: boolean;

  @ApiPropertyOptional({
    description: 'Dias de antecedência padrão para o alerta de vencimento',
    minimum: 0,
    example: 30,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'defaultAlertDays deve ser um número inteiro' })
  @Min(0)
  defaultAlertDays?: number;
}
