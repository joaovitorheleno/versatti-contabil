import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class NotifyDocumentsDto {
  @ApiProperty({
    description: 'IDs dos documentos que serão enviados por e-mail',
    type: [String],
    example: ['9c6732aa-cd03-4425-8797-01367a56f264'],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'Informe ao menos um documento' })
  @ArrayMaxSize(50, { message: 'Máximo de 50 documentos por envio' })
  @IsUUID('4', { each: true, message: 'Cada ID deve ser um UUID válido' })
  documentIds!: string[];

  @ApiPropertyOptional({
    description: 'Envia também para o e-mail do responsável da empresa',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  includeResponsible?: boolean;

  @ApiPropertyOptional({
    description: 'IDs dos usuários vinculados à empresa que receberão o e-mail',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50, { message: 'Máximo de 50 usuários por envio' })
  @IsUUID('4', { each: true, message: 'Cada usuário deve ser um UUID válido' })
  userIds?: string[];
}
