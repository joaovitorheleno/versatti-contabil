import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { RedisModule } from '../redis/redis.module';
import { AlertsController } from './alerts.controller';
import { ExpirationAlertsService } from './expiration-alerts.service';

@Module({
  imports: [MailModule, RedisModule],
  controllers: [AlertsController],
  providers: [ExpirationAlertsService],
})
export class AlertsModule {}
