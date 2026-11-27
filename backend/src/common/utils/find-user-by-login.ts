import { UserEntity } from '../../entities/user.entity';

export const findUserByLogin = async (login: unknown): Promise<UserEntity | null> => {
  const value = typeof login === 'string' ? login.trim() : '';

  if (value.includes('@')) {
    return UserEntity.createQueryBuilder('user')
      .where('LOWER(user.email) = LOWER(:email)', { email: value })
      .getOne();
  }

  const cpf = value.replace(/\D/g, '');
  if (cpf.length !== 11) return null;
  return UserEntity.findOne({ where: { cpf } });
};
