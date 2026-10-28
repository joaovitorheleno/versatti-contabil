import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import {
  EmailCategoryEnum,
  EmailStatusEnum,
} from '../../../enum/email-log.enum';

export class ListEmailLogQueryDto {
  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ enum: EmailStatusEnum })
  @IsOptional()
  @IsEnum(EmailStatusEnum)
  status?: EmailStatusEnum;

  @ApiPropertyOptional({ enum: EmailCategoryEnum })
  @IsOptional()
  @IsEnum(EmailCategoryEnum)
  category?: EmailCategoryEnum;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  clientId?: string;
}
