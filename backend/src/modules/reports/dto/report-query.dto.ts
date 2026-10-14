import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { DocumentCategoryEnum } from '../../../enum/document-category.enum';

export class ReportQueryDto {
  @ApiPropertyOptional({ description: 'Data inicial (YYYY-MM-DD)', example: '2026-10-01' })
  @IsOptional()
  @IsDateString({}, { message: 'from deve estar no formato YYYY-MM-DD' })
  from?: string;

  @ApiPropertyOptional({ description: 'Data final (YYYY-MM-DD)', example: '2026-12-31' })
  @IsOptional()
  @IsDateString({}, { message: 'to deve estar no formato YYYY-MM-DD' })
  to?: string;

  @ApiPropertyOptional({ description: 'Filtra por empresa', format: 'uuid' })
  @IsOptional()
  @IsUUID('4', { message: 'clientId deve ser um UUID válido' })
  clientId?: string;

  @ApiPropertyOptional({ description: 'Filtra por categoria', enum: DocumentCategoryEnum })
  @IsOptional()
  @IsEnum(DocumentCategoryEnum, { message: 'Categoria inválida' })
  category?: DocumentCategoryEnum;
}
