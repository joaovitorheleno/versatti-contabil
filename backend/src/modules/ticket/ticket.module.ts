import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { StorageService } from '../storage/storage.service';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';

@Module({
  imports: [MailModule],
  controllers: [TicketController],
  providers: [TicketService, StorageService],
})
export class TicketModule {}
