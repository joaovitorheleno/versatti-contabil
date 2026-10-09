import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserEntity } from 'src/entities/user.entity';

@Injectable()
export class ListUsersService {
  public async execute(): Promise<Object[]> {
    try {
      const users = await UserEntity.createQueryBuilder('user').getMany();

      if (users == null || users.length == 0) {
        return [];
      }

      return users;
    } catch (e: any) {
      throw new InternalServerErrorException(
        'Não foi possível buscar os usuários',
      );
    }
  }
}
