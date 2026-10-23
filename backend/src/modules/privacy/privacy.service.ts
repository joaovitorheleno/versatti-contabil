import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DocumentEntity } from '../../entities/documents.entity';
import { TicketEntity } from '../../entities/ticket.entity';
import { UserClientEntity } from '../../entities/user-client.entity';
import { UserEntity } from '../../entities/user.entity';
import { AuditActionEnum } from '../../enum/audit-action.enum';
import { AuditService } from '../audit/audit.service';

export const CURRENT_TERMS_VERSION = '2026-10';

@Injectable()
export class PrivacyService {
  constructor(private readonly auditService: AuditService) {}

  public async status(userId: string) {
    const user = await this.findUser(userId);
    return {
      currentVersion: CURRENT_TERMS_VERSION,
      acceptedVersion: user.termsVersion,
      acceptedAt: user.termsAcceptedAt,
      mustAccept: user.termsVersion !== CURRENT_TERMS_VERSION,
    };
  }

  public async accept(userId: string, version: string, req: any) {
    if (version !== CURRENT_TERMS_VERSION) {
      throw new BadRequestException('Versão dos termos desatualizada. Recarregue a página.');
    }

    await UserEntity.update(
      { id: userId },
      { termsAcceptedAt: new Date(), termsVersion: version, updatedBy: userId },
    );

    await this.auditService.record(
      { action: AuditActionEnum.TERMS_ACCEPTED, userId, description: `Termos versão ${version}` },
      req,
    );

    return this.status(userId);
  }

  public async myData(userId: string, req: any) {
    const user = await this.findUser(userId);

    const [links, tickets, documents, accessLog] = await Promise.all([
      UserClientEntity.find({ where: { user: { id: userId } }, relations: { client: true } }),
      TicketEntity.find({
        where: { openedBy: { id: userId } },
        relations: { client: true },
        order: { createdAt: 'DESC' },
      }),
      DocumentEntity.find({
        where: { createdBy: userId },
        relations: { client: true },
        order: { createdAt: 'DESC' },
      }),
      this.auditService.listForUser(userId),
    ]);

    await this.auditService.record(
      { action: AuditActionEnum.PERSONAL_DATA_EXPORT, userId, description: 'Exportação dos próprios dados' },
      req,
    );

    return {
      generatedAt: new Date().toISOString(),
      profile: {
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        termsVersion: user.termsVersion,
        termsAcceptedAt: user.termsAcceptedAt,
      },
      companies: links
        .filter((link) => link.client)
        .map((link) => ({ name: link.client.name, cnpj: link.client.cnpj })),
      ticketsOpened: tickets.map((t) => ({
        number: t.number,
        subject: t.subject,
        company: t.client?.name,
        status: t.status,
        createdAt: t.createdAt,
      })),
      documentsUploaded: documents.map((d) => ({
        title: d.title,
        company: d.client?.name,
        fileName: d.fileName,
        createdAt: d.createdAt,
      })),
      accessLog: accessLog.map((log) => ({
        date: log.createdAt,
        action: log.action,
        company: log.client?.name ?? null,
        description: log.description,
        ip: log.ip,
      })),
    };
  }

  private async findUser(userId: string) {
    const user = await UserEntity.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }
}
