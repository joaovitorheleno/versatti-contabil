import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      // family: 0 resolve IPv4 e IPv6; necessário na rede privada do Railway (*.railway.internal)
      useFactory: () =>
        new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
          family: 0,
        }),
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}