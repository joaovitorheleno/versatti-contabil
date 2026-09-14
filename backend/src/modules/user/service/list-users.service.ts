import { Injectable } from "@nestjs/common";
import { UserEntity } from "src/entities/user.entity";

@Injectable()
export class ListUsersService {
    public async execute() {
        const users = await UserEntity.createQueryBuilder('user')
            .select([
                'user.name',
                'user.cpf',
                'user.email',
                'user.phone',
                'user.dateOfBirth'
            ]).getMany()

        const mappedUsers = users.map((user) => {
            return {
                name: user.name,
                cpf: user.cpf,
                email: user.email,
                phone: user.phone,
                dateOfBirth: user.dateOfBirth
            }
        })

        return mappedUsers
    }
}