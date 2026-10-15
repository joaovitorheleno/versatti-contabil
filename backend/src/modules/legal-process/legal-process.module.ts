import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { LegalProcessController } from './legal-process.controller';
import { LegalProcessService } from './legal-process.service';

@Module({
  imports: [MailModule],
  controllers: [LegalProcessController],
  providers: [LegalProcessService],
})
export class LegalProcessModule {}
