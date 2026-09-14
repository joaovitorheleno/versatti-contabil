import { Injectable } from "@nestjs/common";
import { UserEntity } from "src/entities/user.entity";

@Injectable()
export class ListUsersService {
    public async execute() {
        const users = await UserEntity.createQueryBuilder('user')
            .select([
                'user.id',
                'user.name',
                'user.cpf',
                'user.email',
                'user.phone',
                'user.dateOfBirth'
            ]).getMany();

        const mappedUsers = users.map((user) => {
            return {
                id: user.id,
                name: user.name,
                cpf: user.cpf,
                email: user.email,
                phone: user.phone,
                dateOfBirth: user.dateOfBirth
            }
        });

        return mappedUsers;
    }
}