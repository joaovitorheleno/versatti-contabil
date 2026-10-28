import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { EmailLogController } from './email-log.controller';
import { EmailLogService } from './email-log.service';

@Module({
  imports: [MailModule],
  controllers: [EmailLogController],
  providers: [EmailLogService],
})
export class EmailLogModule {}
