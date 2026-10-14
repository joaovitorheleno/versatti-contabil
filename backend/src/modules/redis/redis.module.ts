import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () =>
        new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
          family: 0,
        }),
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}