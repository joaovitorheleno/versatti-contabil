import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  AccountTypeEnum,
  BankTransactionStatusEnum,
  ClosingTypeEnum,
  RuleDirectionEnum,
} from '../../../enum/accounting.enum';

export class CreateAccountDto {
  @ApiProperty({ example: '4.2.02.011', description: 'Código no formato 1.2.03.004' })
  @Matches(/^\d+(\.\d+)*$/, { message: 'Código inválido. Use números separados por ponto (ex: 4.2.02.011)' })
  @MaxLength(30)
  code!: string;

  @ApiProperty({ example: 'Publicidade e Propaganda' })
  @IsString()
  @IsNotEmpty({ message: 'Informe o nome da conta' })
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional({ enum: AccountTypeEnum, description: 'Se omitido, herda da conta superior' })
  @IsOptional()
  @IsEnum(AccountTypeEnum)
  type?: AccountTypeEnum;
}

export class UpdateAccountDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class JournalLineDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4', { message: 'Conta inválida' })
  accountId!: string;

  @ApiProperty({ example: 150.5 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Débito inválido' })
  @Min(0)
  debit!: number;

  @ApiProperty({ example: 0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Crédito inválido' })
  @Min(0)
  credit!: number;
}

export class CreateJournalEntryDto {
  @ApiProperty({ format: 'date' })
  @IsDateString({}, { message: 'Data inválida' })
  date!: string;

  @ApiProperty({ example: 'Pagamento de aluguel de outubro' })
  @IsString()
  @IsNotEmpty({ message: 'Informe o histórico' })
  @MaxLength(255)
  description!: string;

  @ApiProperty({ type: [JournalLineDto] })
  @IsArray()
  @ArrayMinSize(2, { message: 'O lançamento precisa de ao menos duas linhas' })
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => JournalLineDto)
  lines!: JournalLineDto[];
}

export class PeriodQueryDto {
  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class ListEntriesQueryDto extends PeriodQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  accountId?: string;
}

export class BalanceSheetQueryDto {
  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class ImportStatementDto {
  @ApiProperty({ format: 'uuid', description: 'Conta do plano que representa o banco' })
  @IsUUID('4', { message: 'Selecione a conta bancária' })
  bankAccountId!: string;
}

export class ImportStatementWithFileDto extends ImportStatementDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file!: any;
}

export class ListTransactionsQueryDto extends PeriodQueryDto {
  @ApiPropertyOptional({ enum: BankTransactionStatusEnum })
  @IsOptional()
  @IsEnum(BankTransactionStatusEnum)
  status?: BankTransactionStatusEnum;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  bankAccountId?: string;
}

export class ReconcileItemDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  transactionId!: string;

  @ApiProperty({ format: 'uuid', description: 'Contrapartida do lançamento' })
  @IsUUID('4', { message: 'Selecione a conta de contrapartida' })
  accountId!: string;

  @ApiPropertyOptional({ description: 'Histórico do lançamento (padrão: descrição do extrato)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

export class ReconcileDto {
  @ApiProperty({ type: [ReconcileItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => ReconcileItemDto)
  items!: ReconcileItemDto[];
}

export class UpdateTransactionStatusDto {
  @ApiProperty({ enum: [BankTransactionStatusEnum.PENDING, BankTransactionStatusEnum.IGNORED] })
  @IsIn([BankTransactionStatusEnum.PENDING, BankTransactionStatusEnum.IGNORED], {
    message: 'Situação inválida',
  })
  status!: BankTransactionStatusEnum;
}

export class CreateRuleDto {
  @ApiProperty({ example: 'TARIFA' })
  @IsString()
  @IsNotEmpty({ message: 'Informe o texto a procurar' })
  @MaxLength(100)
  keyword!: string;

  @ApiPropertyOptional({ enum: RuleDirectionEnum, default: RuleDirectionEnum.ANY })
  @IsOptional()
  @IsEnum(RuleDirectionEnum)
  direction?: RuleDirectionEnum;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4', { message: 'Selecione a conta' })
  accountId!: string;
}

export class CreateClosingDto {
  @ApiProperty({ enum: ClosingTypeEnum })
  @IsEnum(ClosingTypeEnum, { message: 'Tipo de fechamento inválido' })
  type!: ClosingTypeEnum;

  @ApiProperty({ example: '2026-10', description: 'MONTH: AAAA-MM · QUARTER: AAAA-T1..T4 · YEAR: AAAA' })
  @Matches(/^\d{4}(-(0[1-9]|1[0-2]|T[1-4]))?$/, { message: 'Referência inválida' })
  reference!: string;
}
