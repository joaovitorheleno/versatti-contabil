import { ForbiddenException } from '@nestjs/common';
import { UserClientEntity } from '../../entities/user-client.entity';
import { UserRole } from '../../enum/user-role.enum';

export interface CurrentUser {
  userId: string;
  role?: string;
}

export const isAdminUser = (user: CurrentUser) => user.role === UserRole.ADMIN;

export const currentUserFrom = (req: any): CurrentUser => ({
  userId: req.user?.userId,
  role: req.user?.role,
});

export const accessibleClientIds = async (
  user: CurrentUser,
): Promise<string[] | null> => {
  if (isAdminUser(user)) return null;

  const links = await UserClientEntity.find({
    where: { user: { id: user.userId } },
    relations: { client: true },
  });

  return links.map((link) => link.client.id);
};

export const assertClientAccess = async (user: CurrentUser, clientId: string) => {
  if (isAdminUser(user)) return;

  const linked = await UserClientEntity.findOne({
    where: { user: { id: user.userId }, client: { id: clientId } },
  });

  if (!linked) {
    throw new ForbiddenException('Você não tem acesso a esta empresa');
  }
};
