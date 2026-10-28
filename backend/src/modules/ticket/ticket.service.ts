import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import 'multer';
import {
  CurrentUser,
  accessibleClientIds,
  assertClientAccess,
  isAdminUser,
} from '../../common/utils/client-access';
import { assertAllowedFile } from '../../common/utils/file-validation';
import { ClientEntity } from '../../entities/client.entity';
import { TicketMessageEntity } from '../../entities/ticket-message.entity';
import { TicketEntity } from '../../entities/ticket.entity';
import { UserEntity } from '../../entities/user.entity';
import {
  TICKET_CATEGORY_LABELS,
  TICKET_STATUS_LABELS,
  TicketPriorityEnum,
  TicketStatusEnum,
} from '../../enum/ticket.enum';
import { UserRole } from '../../enum/user-role.enum';
import { EmailCategoryEnum } from '../../enum/email-log.enum';
import { escapeHtml, renderMailLayout } from '../mail/mail-layout';
import { MailService } from '../mail/mail.service';
import { StorageService } from '../storage/storage.service';
import {
  CreateTicketDto,
  ListTicketQueryDto,
  ReplyTicketDto,
  UpdateTicketStatusDto,
} from './dto/ticket.dto';

const CLOSED_STATUSES = [TicketStatusEnum.RESOLVIDO, TicketStatusEnum.FECHADO];

@Injectable()
export class TicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(
    private readonly mailService: MailService,
    private readonly storageService: StorageService,
  ) {}

  public async list(user: CurrentUser, query: ListTicketQueryDto) {
    const clientIds = await accessibleClientIds(user);
    if (clientIds && clientIds.length === 0) return [];

    const qb = TicketEntity.createQueryBuilder('ticket')
      .innerJoinAndSelect('ticket.client', 'client')
      .innerJoinAndSelect('ticket.openedBy', 'openedBy')
      .orderBy('ticket.lastMessageAt', 'DESC');

    if (clientIds) qb.andWhere('client.id IN (:...clientIds)', { clientIds });
    if (query.clientId) qb.andWhere('client.id = :clientId', { clientId: query.clientId });
    if (query.status) qb.andWhere('ticket.status = :status', { status: query.status });

    const tickets = await qb.getMany();
    if (tickets.length === 0) return [];

    const counts: { ticketId: string; count: string }[] = await TicketMessageEntity.createQueryBuilder('message')
      .select('message.ticket_id', 'ticketId')
      .addSelect('COUNT(*)', 'count')
      .where('message.ticket_id IN (:...ids)', { ids: tickets.map((t) => t.id) })
      .groupBy('message.ticket_id')
      .getRawMany();

    const countById = new Map(counts.map((c) => [c.ticketId, Number(c.count)]));

    return tickets.map((ticket) => this.toSummary(ticket, countById.get(ticket.id) ?? 0));
  }

  public async get(user: CurrentUser, id: string) {
    const ticket = await this.findOrFail(id);
    await assertClientAccess(user, ticket.client.id);

    return {
      ...this.toSummary(ticket),
      messages: ticket.messages
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((m) => ({
          id: m.id,
          body: m.body,
          fromOffice: m.fromOffice,
          createdAt: m.createdAt,
          author: { id: m.author.id, name: m.author.name },
          file: m.fileKey
            ? { name: m.fileName, mime: m.fileMime, size: m.fileSize }
            : null,
        })),
    };
  }

  public async create(user: CurrentUser, dto: CreateTicketDto, file?: Express.Multer.File) {
    const client = await ClientEntity.findOne({ where: { id: dto.clientId } });
    if (!client) throw new NotFoundException('Empresa não encontrada');
    await assertClientAccess(user, client.id);
    if (file) assertAllowedFile(file);

    const ticket = await TicketEntity.create({
      client: { id: client.id },
      openedBy: { id: user.userId },
      subject: dto.subject.trim(),
      category: dto.category,
      priority: dto.priority ?? TicketPriorityEnum.NORMAL,
      status: TicketStatusEnum.ABERTO,
      lastMessageAt: new Date(),
      createdBy: user.userId,
    }).save();

    await this.saveMessage(ticket.id, user, dto.message, file);

    const created = await this.findOrFail(ticket.id);
    if (!isAdminUser(user)) this.inBackground(() => this.notifyOffice(created, dto.message, true));

    return this.get(user, ticket.id);
  }

  public async reply(
    user: CurrentUser,
    id: string,
    dto: ReplyTicketDto,
    file?: Express.Multer.File,
  ) {
    const ticket = await this.findOrFail(id);
    await assertClientAccess(user, ticket.client.id);
    if (file) assertAllowedFile(file);

    const fromOffice = isAdminUser(user);

    if (!fromOffice && ticket.status === TicketStatusEnum.FECHADO) {
      throw new BadRequestException('Este chamado está fechado. Abra um novo chamado.');
    }

    await this.saveMessage(ticket.id, user, dto.message, file);

    let status = ticket.status;
    if (fromOffice && status === TicketStatusEnum.ABERTO) {
      status = TicketStatusEnum.EM_ATENDIMENTO;
    }
    if (!fromOffice && status !== TicketStatusEnum.ABERTO) {
      status = TicketStatusEnum.EM_ATENDIMENTO;
    }

    await TicketEntity.update(
      { id },
      { status, lastMessageAt: new Date(), updatedBy: user.userId },
    );

    if (fromOffice) this.inBackground(() => this.notifyClient(ticket, dto.message));
    else this.inBackground(() => this.notifyOffice(ticket, dto.message, false));

    return this.get(user, id);
  }

  public async updateStatus(user: CurrentUser, id: string, dto: UpdateTicketStatusDto) {
    const ticket = await this.findOrFail(id);
    await assertClientAccess(user, ticket.client.id);

    if (!isAdminUser(user) && dto.status !== TicketStatusEnum.FECHADO) {
      throw new ForbiddenException('O cliente só pode encerrar o chamado');
    }

    await TicketEntity.update({ id }, { status: dto.status, updatedBy: user.userId });

    if (isAdminUser(user) && CLOSED_STATUSES.includes(dto.status) && !CLOSED_STATUSES.includes(ticket.status)) {
      this.inBackground(() => this.notifyClient(
        ticket,
        `O chamado foi marcado como "${TICKET_STATUS_LABELS[dto.status]}". Se ainda precisar de algo, responda pelo sistema.`,
      ));
    }

    return this.get(user, id);
  }

  public async downloadAttachment(user: CurrentUser, id: string, messageId: string) {
    const ticket = await this.findOrFail(id);
    await assertClientAccess(user, ticket.client.id);

    const message = ticket.messages.find((m) => m.id === messageId);
    if (!message?.fileKey) throw new NotFoundException('Anexo não encontrado');

    const path = this.storageService.getPath(message.fileKey);
    if (!existsSync(path)) throw new NotFoundException('Arquivo não encontrado no armazenamento');

    return {
      clientId: ticket.client.id,
      stream: createReadStream(path),
      fileName: message.fileName ?? 'anexo',
      fileMime: message.fileMime ?? 'application/octet-stream',
    };
  }

  private inBackground(task: () => Promise<unknown>) {
    task().catch((e) => this.logger.error(`Falha no envio em segundo plano: ${e?.message ?? e}`));
  }

  private async saveMessage(
    ticketId: string,
    user: CurrentUser,
    body: string,
    file?: Express.Multer.File,
  ) {
    let fileKey: string | null = null;
    if (file) {
      fileKey = await this.storageService.upload(file, `tickets/${ticketId}`);
    }

    try {
      await TicketMessageEntity.create({
        ticket: { id: ticketId },
        author: { id: user.userId },
        fromOffice: isAdminUser(user),
        body: body.trim(),
        fileKey,
        fileName: file?.originalname ?? null,
        fileMime: file?.mimetype ?? null,
        fileSize: file ? String(file.size) : null,
        createdBy: user.userId,
      }).save();
    } catch (e) {
      if (fileKey) await this.storageService.delete(fileKey).catch(() => undefined);
      throw e;
    }
  }

  private async findOrFail(id: string) {
    const ticket = await TicketEntity.findOne({
      where: { id },
      relations: { client: true, openedBy: true, messages: { author: true } },
    });
    if (!ticket) throw new NotFoundException('Chamado não encontrado');
    return ticket;
  }

  private toSummary(ticket: TicketEntity, messageCount?: number) {
    return {
      id: ticket.id,
      number: ticket.number,
      subject: ticket.subject,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      createdAt: ticket.createdAt,
      lastMessageAt: ticket.lastMessageAt,
      messageCount: messageCount ?? ticket.messages?.length ?? 0,
      client: { id: ticket.client.id, name: ticket.client.name, cnpj: ticket.client.cnpj },
      openedBy: { id: ticket.openedBy.id, name: ticket.openedBy.name },
    };
  }

  private async notifyOffice(ticket: TicketEntity, message: string, isNew: boolean) {
    if (!this.mailService.isConfigured()) return;

    const admins = await UserEntity.find({
      where: { role: UserRole.ADMIN },
      select: { email: true },
    });

    for (const email of new Set(admins.map((a) => a.email).filter(Boolean))) {
      await this.safeSend(
        email,
        `${isNew ? 'Novo chamado' : 'Nova resposta'} #${ticket.number} - ${ticket.client.name}`,
        renderMailLayout(
          isNew ? 'Novo chamado aberto' : 'O cliente respondeu um chamado',
          `<p><strong>${escapeHtml(ticket.client.name)}</strong> · ${escapeHtml(TICKET_CATEGORY_LABELS[ticket.category])}</p>
           <p><strong>#${ticket.number} ${escapeHtml(ticket.subject)}</strong></p>
           <blockquote style="border-left:3px solid #e4e7e5;margin:0;padding:8px 12px;color:#12231c;white-space:pre-wrap;">${escapeHtml(message)}</blockquote>
           <p style="color:#6b7a73;">Responda pela tela de Atendimento do sistema.</p>`,
        ),
        ticket.client.id,
      );
    }
  }

  private async notifyClient(ticket: TicketEntity, message: string) {
    if (!this.mailService.isConfigured()) return;

    const recipients = new Set(
      [ticket.openedBy.email, ticket.client.responsibleEmail].filter(Boolean) as string[],
    );

    for (const email of recipients) {
      await this.safeSend(
        email,
        `Resposta do escritório - chamado #${ticket.number}`,
        renderMailLayout(
          'O escritório respondeu seu chamado',
          `<p><strong>#${ticket.number} ${escapeHtml(ticket.subject)}</strong> · ${escapeHtml(ticket.client.name)}</p>
           <blockquote style="border-left:3px solid #e4e7e5;margin:0;padding:8px 12px;color:#12231c;white-space:pre-wrap;">${escapeHtml(message)}</blockquote>
           <p style="color:#6b7a73;">Para responder, acesse a tela de Atendimento do sistema.</p>`,
        ),
        ticket.client.id,
      );
    }
  }

  private async safeSend(to: string, subject: string, html: string, clientId?: string) {
    try {
      await this.mailService.send({
        to,
        subject,
        html,
        log: { category: EmailCategoryEnum.TICKET, clientId },
      });
    } catch (e: any) {
      this.logger.error(`Falha ao enviar e-mail de chamado para ${to}: ${e.message}`);
    }
  }
}
