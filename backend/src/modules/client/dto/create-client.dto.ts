import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { TaxRegimeEnum } from "src/enum/tax-regime.enum";

export class CreateClientDto {
    @IsString({ message: 'O nome deve ser uma string'})
    @IsNotEmpty({ message: 'O nome é obrigatório' })
    @ApiProperty({ 
        description: 'Nome do Cliente/Empresa',
        example: 'Empresa Teste LTDA'
    })
    name!: string;

    @IsString({ message: 'O CNPJ deve ser uma string' })
    @IsNotEmpty({ message: 'O CNPJ é obrigatório' })
    @ApiProperty({ 
        description: 'CNPJ do Cliente/Empresa',
        example: '12345678000190'
    })
    cnpj!: string;

    @IsEnum(TaxRegimeEnum, { message: 'Regime tributário inválido' })
    @IsNotEmpty({ message: 'O regime tributário é obrigatório' })
    @ApiProperty({ 
        description: 'Regime Tributário do Cliente/Empresa',
        enum: TaxRegimeEnum,
        example: TaxRegimeEnum.SIMPLES_NACIONAL
    })
    taxRegime!: TaxRegimeEnum;
}