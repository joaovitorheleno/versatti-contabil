import { BadRequestException } from '@nestjs/common';
import { UserEntity } from 'src/entities/user.entity';

export class DeleteUserService {
  public async execute(userId: string, currentUserId: string) {
    if (!userId) {
      throw new BadRequestException(
        'ID do usuário é obrigatório para exclusão.',
      );
    }

    try {
      const existingUser = await UserEntity.findOne({ where: { id: userId } });

      if (!existingUser) {
        throw new BadRequestException('Usuário não encontrado.');
      }

      existingUser.deletedBy = currentUserId;
      existingUser.save();
      const userToDelete = await existingUser.softRemove();

      return userToDelete;
    } catch (e) {
      throw new BadRequestException('Erro ao buscar usuário para exclusão.');
    }
  }
}
