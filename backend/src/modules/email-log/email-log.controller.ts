import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';
import { ListEmailLogQueryDto } from './dto/list-email-log-query.dto';
import { EmailLogService, type ResendWebhookEvent } from './email-log.service';

@ApiTags('E-mails enviados')
@Controller()
export class EmailLogController {
  constructor(private readonly service: EmailLogService) {}

  @Get('email-log')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Histórico de e-mails enviados com status de entrega' })
  list(@Query() query: ListEmailLogQueryDto) {
    return this.service.list(query);
  }

  @Public()
  @Post('webhooks/resend')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  webhook(@Req() req: any, @Body() event: ResendWebhookEvent) {
    this.service.verifySignature(req.headers, req.rawBody);
    return this.service.handleEvent(event);
  }
}
