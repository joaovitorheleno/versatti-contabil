import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditService } from './audit.service';
import { ListAuditQueryDto } from './dto/list-audit-query.dto';

@ApiTags('Auditoria')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Registro de acessos (até 1000 mais recentes do filtro)' })
  list(@Query() query: ListAuditQueryDto) {
    return this.auditService.list(query);
  }
}
