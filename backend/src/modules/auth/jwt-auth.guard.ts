import { Injectable, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import Redis from 'ioredis';
import { IS_PUBLIC_KEY } from './public.decorator';

const TEMPO_INATIVIDADE = 15 * 60;

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    @Inject('REDIS_CLIENT') private redis: Redis,
    private reflector: Reflector,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const valido = (await super.canActivate(context)) as boolean;
    if (!valido) return false;

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId || request.user?.id;
    const chave = `ultima_atividade:${userId}`;

    const ultimaAtividade = await this.redis.get(chave);

    if (ultimaAtividade) {
      const segundosInativo = (Date.now() - Number(ultimaAtividade)) / 1000;
      if (segundosInativo > TEMPO_INATIVIDADE) {
        await this.redis.del(chave);
        throw new UnauthorizedException('Sessão expirada por inatividade');
      }
    }

    await this.redis.set(chave, Date.now().toString(), 'EX', TEMPO_INATIVIDADE);

    return true;
  }
}