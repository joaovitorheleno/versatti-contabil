import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class NotifyDocumentsDto {
  @ApiProperty({
    description: 'IDs dos documentos que serão enviados por e-mail ao responsável',
    type: [String],
    example: ['9c6732aa-cd03-4425-8797-01367a56f264'],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'Informe ao menos um documento' })
  @ArrayMaxSize(50, { message: 'Máximo de 50 documentos por envio' })
  @IsUUID('4', { each: true, message: 'Cada ID deve ser um UUID válido' })
  documentIds!: string[];
}
