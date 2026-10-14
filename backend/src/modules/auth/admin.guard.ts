import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from '../../enum/user-role.enum';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (request.user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Apenas administradores podem realizar esta ação',
      );
    }

    return true;
  }
}
