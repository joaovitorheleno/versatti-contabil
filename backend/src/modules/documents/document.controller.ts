import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import 'multer';
import type { Response } from 'express';
import {
  CreateDocumentDto,
  CreateDocumentWithFileDto,
} from './dto/create-document.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { AuditActionEnum } from '../../enum/audit-action.enum';
import { AuditService } from '../audit/audit.service';
import {
  CreateDocumentService,
  CreateDocumentTypeService,
  DeleteDocumentTypeService,
  DownloadDocumentService,
  ListDocumentsService,
  ListDocumentTypesService,
  NotifyDocumentsService,
} from './services';
import type { DownloadFormat } from './services/download-document.service';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto';
import { NotifyDocumentsDto } from './dto/notify-documents.dto';

@ApiTags('Documentos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('document')
export class DocumentController {
  constructor(
    private readonly createDocumentService: CreateDocumentService,
    private readonly createDocumentTypeService: CreateDocumentTypeService,
    private readonly listDocumentTypesService: ListDocumentTypesService,
    private readonly listDocumentsService: ListDocumentsService,
    private readonly downloadDocumentService: DownloadDocumentService,
    private readonly deleteDocumentTypeService: DeleteDocumentTypeService,
    private readonly notifyDocumentsService: NotifyDocumentsService,
    private readonly auditService: AuditService,
  ) {}

  @Post('notify')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Envia os documentos por e-mail ao responsável e aos usuários selecionados da empresa (anexando os arquivos)',
  })
  @ApiResponse({ status: 200, description: 'Resultado do envio por empresa' })
  @ApiResponse({ status: 503, description: 'SMTP não configurado no servidor' })
  notify(@Body() dto: NotifyDocumentsDto) {
    return this.notifyDocumentsService.execute(dto.documentIds, {
      includeResponsible: dto.includeResponsible,
      userIds: dto.userIds,
    });
  }

  @Get()
  @ApiOperation({
    summary:
      'Lista os documentos. Admin vê todos; usuário comum vê os das suas empresas',
  })
  @ApiQuery({
    name: 'clientId',
    required: false,
    description: 'Filtra por empresa',
  })
  list(
    @Req() req: any,
    @Query('clientId', new ParseUUIDPipe({ optional: true })) clientId?: string,
  ) {
    return this.listDocumentsService.execute({
      userId: req.user?.userId,
      role: req.user?.role,
      clientId,
    });
  }

  @Get(':id/download')
  @ApiOperation({
    summary:
      'Baixa o arquivo de um documento. Para XML de NF-e/NFC-e, format=pdf gera o DANFE',
  })
  @ApiQuery({
    name: 'format',
    required: false,
    enum: ['xml', 'pdf'],
    description: 'Formato desejado. Sem informar, devolve o arquivo original',
  })
  @ApiResponse({ status: 400, description: 'Formato indisponível para o documento' })
  @ApiResponse({ status: 403, description: 'Sem permissão para o documento' })
  @ApiResponse({
    status: 404,
    description: 'Documento ou arquivo não encontrado',
  })
  @ApiResponse({
    status: 422,
    description: 'XML não é de NF-e/NFC-e autorizada; não gera DANFE',
  })
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
    @Query('format') format?: string,
  ) {
    if (format !== undefined && format !== 'xml' && format !== 'pdf') {
      throw new BadRequestException('format deve ser "xml" ou "pdf"');
    }

    const file = await this.downloadDocumentService.execute({
      documentId: id,
      userId: req.user?.userId,
      role: req.user?.role,
      format: format as DownloadFormat | undefined,
    });

    await this.auditService.record(
      {
        action: AuditActionEnum.DOCUMENT_DOWNLOAD,
        clientId: file.clientId,
        entityId: id,
        description: `${file.fileName}${format ? ` (${format.toUpperCase()})` : ''}`,
      },
      req,
    );

    res.set({
      'Content-Type': file.fileMime,
      'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(file.fileName)}`,
    });

    return new StreamableFile(file.stream);
  }

  @Get('type')
  @ApiOperation({ summary: 'Lista os tipos de documento ativos' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de documento' })
  listTypes() {
    return this.listDocumentTypesService.execute();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria um documento para um cliente' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateDocumentWithFileDto })
  @ApiResponse({ status: 201, description: 'Documento criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({
    status: 404,
    description: 'Cliente ou tipo de documento não encontrado',
  })
  @ApiResponse({ status: 413, description: 'Arquivo maior que 10 MB' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async create(
    @Body() dto: CreateDocumentDto,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const document = await this.createDocumentService.execute(dto, file, {
      userId: req.user?.userId,
      role: req.user?.role,
    });

    await this.auditService.record(
      {
        action: AuditActionEnum.DOCUMENT_UPLOAD,
        clientId: dto.clientId,
        entityId: document.id,
        description: document.title,
      },
      req,
    );

    return document;
  }

  @Post('type')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria um tipo de documento' })
  @ApiResponse({ status: 201, description: 'Tipo criado com sucesso' })
  @ApiResponse({ status: 403, description: 'Apenas administradores' })
  @ApiResponse({ status: 409, description: 'Código já cadastrado' })
  createType(@Body() dto: CreateDocumentTypeDto, @Req() req: any) {
    return this.createDocumentTypeService.execute(dto, req.user?.userId);
  }

  @Delete('type/:id')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Exclui um tipo de documento sem documentos vinculados',
  })
  @ApiResponse({ status: 200, description: 'Tipo excluído com sucesso' })
  @ApiResponse({ status: 403, description: 'Apenas administradores' })
  @ApiResponse({ status: 404, description: 'Tipo não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Existem documentos usando este tipo',
  })
  deleteType(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const userId = req.user?.userId;
    return this.deleteDocumentTypeService.execute(id, userId);
  }
}
