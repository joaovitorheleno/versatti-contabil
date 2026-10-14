import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({
    summary:
      'Indicadores de documentos. Admin vê todas as empresas; usuário comum, as suas',
  })
  @ApiResponse({ status: 200, description: 'Dados agregados do dashboard' })
  get(@Req() req: any) {
    return this.dashboardService.execute({
      userId: req.user?.userId,
      role: req.user?.role,
    });
  }
}
