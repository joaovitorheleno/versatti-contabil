import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import {
  LegalProcessStatusEnum,
  LegalProcessTypeEnum,
} from '../../../enum/legal-process.enum';

export class CreateLegalProcessDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4', { message: 'clientId deve ser um UUID válido' })
  clientId!: string;

  @ApiProperty({ enum: LegalProcessTypeEnum })
  @IsEnum(LegalProcessTypeEnum, { message: 'Tipo de processo inválido' })
  type!: LegalProcessTypeEnum;

  @ApiProperty({ example: 'Abertura da filial de Contagem' })
  @IsString()
  @IsNotEmpty({ message: 'O título é obrigatório' })
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ format: 'date', example: '2026-12-15' })
  @IsOptional()
  @IsDateString({}, { message: 'expectedEndDate deve estar no formato YYYY-MM-DD' })
  expectedEndDate?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Etapas. Se omitido, usa as etapas padrão do tipo',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(255, { each: true })
  steps?: string[];
}

export class UpdateLegalProcessDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: LegalProcessStatusEnum })
  @IsOptional()
  @IsEnum(LegalProcessStatusEnum, { message: 'Situação inválida' })
  status?: LegalProcessStatusEnum;

  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString({}, { message: 'expectedEndDate deve estar no formato YYYY-MM-DD' })
  expectedEndDate?: string;
}

export class UpdateLegalProcessStepDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  done?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class AddLegalProcessStepDto {
  @ApiProperty({ example: 'Licença ambiental' })
  @IsString()
  @IsNotEmpty({ message: 'O nome da etapa é obrigatório' })
  @MaxLength(255)
  name!: string;
}

export class ListLegalProcessQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  clientId?: string;

  @ApiPropertyOptional({ enum: LegalProcessStatusEnum })
  @IsOptional()
  @IsEnum(LegalProcessStatusEnum)
  status?: LegalProcessStatusEnum;
}
