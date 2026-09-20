import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class CreateUserDto {
    @IsString({ message: 'O nome deve ser uma string' })
    @IsNotEmpty({ message: 'O nome é obrigatório' })
    @ApiProperty({ 
        description: 'Nome do usuário',
        example: 'João da Silva'
    })
    name!: string;

    @IsString({ message: 'O email deve ser uma string' })
    @IsNotEmpty({ message: 'O email é obrigatório' })
    @ApiProperty({ 
        description: 'Email do usuário',
        example: 'joao.silva@example.com'
    })
    email!: string;

    @IsString({ message: 'O CPF deve ser uma string' })
    @IsNotEmpty({ message: 'O CPF é obrigatório' })
    @ApiProperty({ 
        description: 'Cpf do usuário',
        example: '123.456.789-00'
    })
    cpf!: string;

    @IsString({ message: 'O telefone deve ser uma string' })
    @IsNotEmpty({ message: 'O telefone é obrigatório' })
    @ApiProperty({ 
        description: 'Telefone do usuário',
        example: '(11) 91234-5678'
    })
    phone!: string;

    @IsString({ message: 'A senha deve ser uma string' })
    @IsOptional()
    @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
    @ApiProperty({ 
        description: 'Senha do usuário',
        example: '123Aa'
    })
    password?: string;

    @IsDateString({}, { message: 'A data de nascimento deve estar no formato YYYY-MM-DD' })
    @IsNotEmpty({ message: 'A data de nascimento é obrigatória' })
    @ApiProperty({ example: '2005-03-04' })
    dateOfBirth!: string;

    @IsArray({ message: 'O campo clientIds deve ser uma lista de IDs' })
    @IsNotEmpty({ message: 'Deve ser informada pelo menos uma empresa ao usuário' })
    @IsUUID('4', { each: true, message: 'Cada ID de cliente deve ser um UUID válido' })
    @ApiProperty({
        description: 'Lista de IDs dos clientes vinculados',
        example: ['ce3e3576-bc2e-4d46-a387-b87953f0c232'],
        type: [String]
    })
    clientIds!: string[];
}