import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportQueryDto } from './dto/report-query.dto';
import { ReportsService } from './reports.service';

@ApiTags('Relatórios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('report')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('expirations')
  @ApiOperation({ summary: 'Documentos que vencem entre from e to' })
  @ApiResponse({ status: 400, description: 'Período inválido' })
  expirations(@Req() req: any, @Query() filters: ReportQueryDto) {
    return this.reportsService.expirations(this.currentUser(req), filters);
  }

  @Get('compliance')
  @ApiOperation({
    summary:
      'Checklist por empresa dos tipos que exigem vencimento: em dia, vencendo, vencido ou faltando',
  })
  compliance(@Req() req: any, @Query() filters: ReportQueryDto) {
    return this.reportsService.compliance(this.currentUser(req), filters);
  }

  @Get('uploads')
  @ApiOperation({ summary: 'Documentos enviados entre from e to, com quem enviou' })
  @ApiResponse({ status: 400, description: 'Período inválido' })
  uploads(@Req() req: any, @Query() filters: ReportQueryDto) {
    return this.reportsService.uploads(this.currentUser(req), filters);
  }

  private currentUser(req: any) {
    return { userId: req.user?.userId, role: req.user?.role };
  }
}
