import { Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExpirationAlertsService } from './expiration-alerts.service';

@ApiTags('Alertas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly expirationAlertsService: ExpirationAlertsService) {}

  @Post('expiration/run')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Executa agora os alertas de vencimento (também rodam sozinhos todo dia às 8h, horário de Brasília)',
  })
  @ApiResponse({ status: 200, description: 'Resumo dos alertas enviados' })
  runExpiration() {
    return this.expirationAlertsService.run();
  }
}
