import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import {
  TicketCategoryEnum,
  TicketPriorityEnum,
  TicketStatusEnum,
} from '../../../enum/ticket.enum';

export class CreateTicketDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4', { message: 'clientId deve ser um UUID válido' })
  clientId!: string;

  @ApiProperty({ example: 'Admissão de novo vendedor' })
  @IsString()
  @IsNotEmpty({ message: 'O assunto é obrigatório' })
  @MaxLength(200)
  subject!: string;

  @ApiProperty({ enum: TicketCategoryEnum })
  @IsEnum(TicketCategoryEnum, { message: 'Categoria inválida' })
  category!: TicketCategoryEnum;

  @ApiPropertyOptional({ enum: TicketPriorityEnum, default: TicketPriorityEnum.NORMAL })
  @IsOptional()
  @IsEnum(TicketPriorityEnum, { message: 'Prioridade inválida' })
  priority?: TicketPriorityEnum;

  @ApiProperty({ example: 'Contratamos o João a partir do dia 01. Seguem os documentos.' })
  @IsString()
  @IsNotEmpty({ message: 'A mensagem é obrigatória' })
  @MaxLength(5000)
  message!: string;
}

export class CreateTicketWithFileDto extends CreateTicketDto {
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  file?: any;
}

export class ReplyTicketDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'A mensagem é obrigatória' })
  @MaxLength(5000)
  message!: string;
}

export class ReplyTicketWithFileDto extends ReplyTicketDto {
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  file?: any;
}

export class UpdateTicketStatusDto {
  @ApiProperty({ enum: TicketStatusEnum })
  @IsEnum(TicketStatusEnum, { message: 'Situação inválida' })
  status!: TicketStatusEnum;
}

export class ListTicketQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  clientId?: string;

  @ApiPropertyOptional({ enum: TicketStatusEnum })
  @IsOptional()
  @IsEnum(TicketStatusEnum)
  status?: TicketStatusEnum;
}
