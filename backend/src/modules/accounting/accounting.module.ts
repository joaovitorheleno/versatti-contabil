import { Module } from '@nestjs/common';
import { AccountingController } from './accounting.controller';
import { BankService } from './services/bank.service';
import { ChartService } from './services/chart.service';
import { ClosingService } from './services/closing.service';
import { JournalService } from './services/journal.service';
import { StatementsService } from './services/statements.service';

@Module({
  controllers: [AccountingController],
  providers: [
    ChartService,
    ClosingService,
    JournalService,
    BankService,
    StatementsService,
  ],
})
export class AccountingModule {}
