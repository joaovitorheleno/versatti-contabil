import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import 'multer';
import {
  assertClientAccess,
  currentUserFrom,
} from '../../common/utils/client-access';
import { AdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  BalanceSheetQueryDto,
  CreateAccountDto,
  CreateClosingDto,
  CreateJournalEntryDto,
  CreateRuleDto,
  ImportStatementDto,
  ImportStatementWithFileDto,
  ListEntriesQueryDto,
  ListTransactionsQueryDto,
  PeriodQueryDto,
  ReconcileDto,
  UpdateAccountDto,
  UpdateTransactionStatusDto,
} from './dto/accounting.dto';
import { BankService } from './services/bank.service';
import { ChartService } from './services/chart.service';
import { ClosingService } from './services/closing.service';
import { JournalService } from './services/journal.service';
import { StatementsService } from './services/statements.service';

@ApiTags('Contabilidade')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounting/:clientId')
export class AccountingController {
  constructor(
    private readonly chart: ChartService,
    private readonly journal: JournalService,
    private readonly bank: BankService,
    private readonly statements: StatementsService,
    private readonly closing: ClosingService,
  ) {}

  @Get('accounts')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Plano de contas da empresa' })
  listAccounts(@Param('clientId', ParseUUIDPipe) clientId: string) {
    return this.chart.list(clientId);
  }

  @Post('accounts/default')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Cria o plano de contas padrão (empresa sem plano)' })
  createDefaultChart(@Req() req: any, @Param('clientId', ParseUUIDPipe) clientId: string) {
    return this.chart.createDefault(currentUserFrom(req), clientId);
  }

  @Post('accounts')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Cria uma conta (a superior vira sintética)' })
  createAccount(
    @Req() req: any,
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Body() dto: CreateAccountDto,
  ) {
    return this.chart.create(currentUserFrom(req), clientId, dto);
  }

  @Patch('accounts/:id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Renomeia ou ativa/desativa a conta' })
  updateAccount(
    @Req() req: any,
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.chart.update(currentUserFrom(req), clientId, id, dto);
  }

  @Delete('accounts/:id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Exclui conta sem lançamentos e sem subcontas' })
  removeAccount(
    @Req() req: any,
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.chart.remove(currentUserFrom(req), clientId, id);
  }

  @Get('entries')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Lançamentos contábeis do período' })
  listEntries(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Query() query: ListEntriesQueryDto,
  ) {
    return this.journal.list(clientId, query);
  }

  @Post('entries')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Cria lançamento manual em partidas dobradas' })
  createEntry(
    @Req() req: any,
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Body() dto: CreateJournalEntryDto,
  ) {
    return this.journal.create(currentUserFrom(req), clientId, dto);
  }

  @Delete('entries/:id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Exclui lançamento de período aberto (desfaz a conciliação)' })
  removeEntry(
    @Req() req: any,
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.journal.remove(currentUserFrom(req), clientId, id);
  }

  @Post('bank-imports')
  @UseGuards(AdminGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ImportStatementWithFileDto })
  @ApiOperation({ summary: 'Importa extrato bancário OFX ou CSV (ignora duplicados)' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  importStatement(
    @Req() req: any,
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Body() dto: ImportStatementDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.bank.importStatement(currentUserFrom(req), clientId, dto, file);
  }

  @Get('bank-imports')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Histórico de importações de extrato' })
  listImports(@Param('clientId', ParseUUIDPipe) clientId: string) {
    return this.bank.listImports(clientId);
  }

  @Get('bank-transactions')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Movimentações de extrato' })
  listTransactions(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Query() query: ListTransactionsQueryDto,
  ) {
    return this.bank.listTransactions(clientId, query);
  }

  @Post('bank-transactions/reconcile')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Concilia movimentações gerando os lançamentos contábeis' })
  reconcile(
    @Req() req: any,
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Body() dto: ReconcileDto,
  ) {
    return this.bank.reconcile(currentUserFrom(req), clientId, dto);
  }

  @Post('bank-transactions/auto-reconcile')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Concilia automaticamente as pendentes que casam com alguma regra' })
  autoReconcile(@Req() req: any, @Param('clientId', ParseUUIDPipe) clientId: string) {
    return this.bank.autoReconcile(currentUserFrom(req), clientId);
  }

  @Patch('bank-transactions/:id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Ignora ou volta a deixar pendente uma movimentação' })
  updateTransaction(
    @Req() req: any,
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionStatusDto,
  ) {
    return this.bank.updateStatus(currentUserFrom(req), clientId, id, dto);
  }

  @Get('rules')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Regras de conciliação automática' })
  listRules(@Param('clientId', ParseUUIDPipe) clientId: string) {
    return this.bank.listRules(clientId);
  }

  @Post('rules')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Cria regra: texto do extrato → conta de contrapartida' })
  createRule(
    @Req() req: any,
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Body() dto: CreateRuleDto,
  ) {
    return this.bank.createRule(currentUserFrom(req), clientId, dto);
  }

  @Delete('rules/:id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Exclui regra de conciliação' })
  removeRule(
    @Req() req: any,
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bank.removeRule(currentUserFrom(req), clientId, id);
  }

  @Get('reports/trial-balance')
  @ApiOperation({ summary: 'Balancete de verificação' })
  async trialBalance(
    @Req() req: any,
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Query() query: PeriodQueryDto,
  ) {
    await assertClientAccess(currentUserFrom(req), clientId);
    return this.statements.trialBalance(clientId, query);
  }

  @Get('reports/income-statement')
  @ApiOperation({ summary: 'Demonstração do Resultado (DRE)' })
  async incomeStatement(
    @Req() req: any,
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Query() query: PeriodQueryDto,
  ) {
    await assertClientAccess(currentUserFrom(req), clientId);
    return this.statements.incomeStatement(clientId, query);
  }

  @Get('reports/balance-sheet')
  @ApiOperation({ summary: 'Balanço Patrimonial na data' })
  async balanceSheet(
    @Req() req: any,
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Query() query: BalanceSheetQueryDto,
  ) {
    await assertClientAccess(currentUserFrom(req), clientId);
    return this.statements.balanceSheet(clientId, query);
  }

  @Get('closings')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Fechamentos de período' })
  listClosings(@Param('clientId', ParseUUIDPipe) clientId: string) {
    return this.closing.list(clientId);
  }

  @Post('closings')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Fecha mês, trimestre ou ano (bloqueia alterações até o fim do período)' })
  close(
    @Req() req: any,
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Body() dto: CreateClosingDto,
  ) {
    return this.closing.close(currentUserFrom(req), clientId, dto);
  }

  @Delete('closings/latest')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Reabre o último fechamento' })
  reopen(@Req() req: any, @Param('clientId', ParseUUIDPipe) clientId: string) {
    return this.closing.reopenLatest(currentUserFrom(req), clientId);
  }
}
