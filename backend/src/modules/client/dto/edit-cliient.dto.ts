import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TaxRegimeEnum } from 'src/enum/tax-regime.enum';

export class EditClientDto {
  @IsString({ message: 'O nome deve ser uma string' })
  @IsOptional()
  @ApiProperty({
    description: 'Nome do Cliente/Empresa',
    example: 'Empresa Teste LTDA',
  })
  name?: string | undefined;

  @IsString({ message: 'O CNPJ deve ser uma string' })
  @IsOptional()
  @ApiProperty({
    description: 'CNPJ do Cliente/Empresa',
    example: '12345678000190',
  })
  cnpj?: string | undefined;

  @IsEnum(TaxRegimeEnum, { message: 'Regime tributário inválido' })
  @IsOptional()
  @ApiProperty({
    description: 'Regime Tributário do Cliente/Empresa',
    enum: TaxRegimeEnum,
    example: TaxRegimeEnum.SIMPLES_NACIONAL,
  })
  taxRegime?: TaxRegimeEnum | undefined;
}
