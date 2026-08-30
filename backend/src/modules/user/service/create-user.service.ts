import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { CreateUserDto } from "../dto/create-user.dto";
import { UserEntity } from "src/entities/user.entity";
import * as bcrypt from "bcrypt";

@Injectable()
export class CreateUserService {
    public async execute(userData: CreateUserDto) {
        const { name, email, cpf, phone, password, dateOfBirth } = userData;

        const cleanCpf = cpf.replace(/\D/g, '');
        const cleanEmail = email.trim().toLowerCase();
        const cleanPhone = phone ? phone.replace(/\D/g, '') : '';

        const existingUser = await UserEntity.findOne({
            where: [
                { cpf: cleanCpf },
                { email: cleanEmail },
                ...(cleanPhone ? [{ phone: cleanPhone }] : []),
            ],
        });

        if (existingUser) {
            if (existingUser.cpf === cleanCpf) throw new ConflictException('CPF já cadastrado');
            if (existingUser.email === cleanEmail) throw new ConflictException('Email já cadastrado');
            if (existingUser.phone === cleanPhone) throw new ConflictException('Telefone já cadastrado');
        }

        const [year, month, day] = dateOfBirth.split('-').map(Number);
        
        const birthDate = new Date(year, month - 1, day, 12, 0, 0);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (birthDate.getFullYear() < 1900 || birthDate > today) {
            throw new BadRequestException('Data de nascimento inválida.');
        }

        if (age < 18) {
            throw new BadRequestException('Usuário deve ter no mínimo 18 anos.');
        }

        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const user = new UserEntity();
            user.name = name;
            user.email = cleanEmail;
            user.cpf = cleanCpf;
            user.phone = cleanPhone;
            user.password = hashedPassword;
            
            user.dateOfBirth = dateOfBirth; 
            user.createdAt = new Date();

            const savedUser = await user.save();

            delete (savedUser as any).password;

            return savedUser;
        } catch (error) {
            throw new BadRequestException('Erro ao criar usuário.');
        }
    }
}