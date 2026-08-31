import { Injectable, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import Redis from 'ioredis';

const TEMPO_INATIVIDADE = 15 * 60;

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(@Inject('REDIS_CLIENT') private redis: Redis) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const valido = (await super.canActivate(context)) as boolean;
    if (!valido) return false;

    const request = context.switchToHttp().getRequest();
    const userId = request.user.userId;
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