import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
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
import type { Response } from 'express';
import 'multer';
import { currentUserFrom } from '../../common/utils/client-access';
import { MAX_UPLOAD_SIZE } from '../../common/utils/file-validation';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditActionEnum } from '../../enum/audit-action.enum';
import { AuditService } from '../audit/audit.service';
import {
  CreateTicketDto,
  CreateTicketWithFileDto,
  ListTicketQueryDto,
  ReplyTicketDto,
  ReplyTicketWithFileDto,
  UpdateTicketStatusDto,
} from './dto/ticket.dto';
import { TicketService } from './ticket.service';

@ApiTags('Atendimento')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ticket')
export class TicketController {
  constructor(
    private readonly service: TicketService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista chamados (admin: todos; cliente: os das suas empresas)' })
  list(@Req() req: any, @Query() query: ListTicketQueryDto) {
    return this.service.list(currentUserFrom(req), query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chamado com o histórico de mensagens' })
  get(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.get(currentUserFrom(req), id);
  }

  @Post()
  @ApiOperation({ summary: 'Abre um chamado (com anexo opcional)' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({ type: CreateTicketWithFileDto })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_SIZE } }))
  create(
    @Req() req: any,
    @Body() dto: CreateTicketDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.create(currentUserFrom(req), dto, file);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Responde o chamado (com anexo opcional)' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({ type: ReplyTicketWithFileDto })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_SIZE } }))
  reply(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplyTicketDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.reply(currentUserFrom(req), id, dto, file);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Altera a situação (cliente só pode fechar)' })
  updateStatus(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return this.service.updateStatus(currentUserFrom(req), id, dto);
  }

  @Get(':id/messages/:messageId/file')
  @ApiOperation({ summary: 'Baixa o anexo de uma mensagem' })
  async download(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.service.downloadAttachment(currentUserFrom(req), id, messageId);

    await this.auditService.record(
      {
        action: AuditActionEnum.TICKET_ATTACHMENT_DOWNLOAD,
        clientId: file.clientId,
        entityId: messageId,
        description: file.fileName,
      },
      req,
    );

    res.set({
      'Content-Type': file.fileMime,
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.fileName)}`,
    });

    return new StreamableFile(file.stream);
  }
}
