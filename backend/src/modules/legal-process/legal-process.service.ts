import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { In } from 'typeorm';
import {
  CurrentUser,
  accessibleClientIds,
  assertClientAccess,
} from '../../common/utils/client-access';
import { todayKey } from '../../common/utils/document-dates';
import { ClientEntity } from '../../entities/client.entity';
import { LegalProcessStepEntity } from '../../entities/legal-process-step.entity';
import { LegalProcessEntity } from '../../entities/legal-process.entity';
import {
  DEFAULT_PROCESS_STEPS,
  LegalProcessStatusEnum,
} from '../../enum/legal-process.enum';
import { escapeHtml, renderMailLayout } from '../mail/mail-layout';
import { MailService } from '../mail/mail.service';
import {
  AddLegalProcessStepDto,
  CreateLegalProcessDto,
  ListLegalProcessQueryDto,
  UpdateLegalProcessDto,
  UpdateLegalProcessStepDto,
} from './dto/legal-process.dto';

const TYPE_LABELS: Record<string, string> = {
  ABERTURA: 'Abertura',
  ALTERACAO: 'Alteração contratual',
  BAIXA: 'Baixa',
  OUTRO: 'Processo',
};

@Injectable()
export class LegalProcessService {
  private readonly logger = new Logger(LegalProcessService.name);

  constructor(private readonly mailService: MailService) {}

  public async list(user: CurrentUser, query: ListLegalProcessQueryDto) {
    const clientIds = await accessibleClientIds(user);
    if (clientIds && clientIds.length === 0) return [];

    const qb = LegalProcessEntity.createQueryBuilder('process')
      .innerJoinAndSelect('process.client', 'client')
      .leftJoinAndSelect('process.steps', 'step')
      .orderBy('process.createdAt', 'DESC')
      .addOrderBy('step.position', 'ASC');

    if (clientIds) qb.andWhere('client.id IN (:...clientIds)', { clientIds });
    if (query.clientId) qb.andWhere('client.id = :clientId', { clientId: query.clientId });
    if (query.status) qb.andWhere('process.status = :status', { status: query.status });

    const processes = await qb.getMany();
    return processes.map((process) => this.toResponse(process));
  }

  public async get(user: CurrentUser, id: string) {
    const process = await this.findOrFail(id);
    await assertClientAccess(user, process.client.id);
    return this.toResponse(process);
  }

  public async create(user: CurrentUser, dto: CreateLegalProcessDto) {
    const client = await ClientEntity.findOne({ where: { id: dto.clientId } });
    if (!client) throw new NotFoundException('Empresa não encontrada');

    const stepNames = (dto.steps ?? DEFAULT_PROCESS_STEPS[dto.type])
      .map((name) => name.trim())
      .filter(Boolean);

    const process = LegalProcessEntity.create({
      client: { id: client.id },
      type: dto.type,
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      expectedEndDate: dto.expectedEndDate ?? null,
      status: LegalProcessStatusEnum.EM_ANDAMENTO,
      createdBy: user.userId,
      steps: stepNames.map((name, index) =>
        LegalProcessStepEntity.create({ name, position: index + 1, createdBy: user.userId }),
      ),
    });

    const saved = await process.save();
    return this.get(user, saved.id);
  }

  public async update(user: CurrentUser, id: string, dto: UpdateLegalProcessDto) {
    const process = await this.findOrFail(id);

    if (dto.title !== undefined) process.title = dto.title.trim();
    if (dto.description !== undefined) process.description = dto.description.trim() || null;
    if (dto.expectedEndDate !== undefined) process.expectedEndDate = dto.expectedEndDate;
    if (dto.status !== undefined) {
      process.status = dto.status;
      process.finishedAt =
        dto.status === LegalProcessStatusEnum.CONCLUIDO ? todayKey() : null;
    }
    process.updatedBy = user.userId;

    await LegalProcessEntity.save(process);
    return this.get(user, id);
  }

  public async addStep(user: CurrentUser, id: string, dto: AddLegalProcessStepDto) {
    const process = await this.findOrFail(id);
    const nextPosition = Math.max(0, ...process.steps.map((s) => s.position)) + 1;

    await LegalProcessStepEntity.create({
      process: { id },
      name: dto.name.trim(),
      position: nextPosition,
      createdBy: user.userId,
    }).save();

    if (process.status === LegalProcessStatusEnum.CONCLUIDO) {
      await LegalProcessEntity.update(
        { id },
        { status: LegalProcessStatusEnum.EM_ANDAMENTO, finishedAt: null, updatedBy: user.userId },
      );
    }

    return this.get(user, id);
  }

  public async updateStep(
    user: CurrentUser,
    id: string,
    stepId: string,
    dto: UpdateLegalProcessStepDto,
  ) {
    const process = await this.findOrFail(id);
    const step = process.steps.find((s) => s.id === stepId);
    if (!step) throw new NotFoundException('Etapa não encontrada');

    const justCompleted = dto.done === true && !step.done;

    if (dto.done !== undefined) {
      step.done = dto.done;
      step.doneAt = dto.done ? todayKey() : null;
    }
    if (dto.notes !== undefined) step.notes = dto.notes.trim() || null;
    step.updatedBy = user.userId;
    await LegalProcessStepEntity.save(step);

    const allDone = process.steps.length > 0 && process.steps.every((s) => s.done);
    const finished = allDone && process.status !== LegalProcessStatusEnum.CONCLUIDO;

    if (finished) {
      await LegalProcessEntity.update(
        { id },
        { status: LegalProcessStatusEnum.CONCLUIDO, finishedAt: todayKey(), updatedBy: user.userId },
      );
    } else if (!allDone && process.status === LegalProcessStatusEnum.CONCLUIDO) {
      await LegalProcessEntity.update(
        { id },
        { status: LegalProcessStatusEnum.EM_ANDAMENTO, finishedAt: null, updatedBy: user.userId },
      );
    }

    if (justCompleted) {
      this.inBackground(() => this.notifyStepDone(process, step, finished));
    }

    return this.get(user, id);
  }

  public async remove(user: CurrentUser, id: string) {
    await this.findOrFail(id);
    await LegalProcessEntity.update({ id }, { deletedBy: user.userId, deletedAt: new Date() });
    return { message: 'Processo excluído' };
  }

  private inBackground(task: () => Promise<unknown>) {
    task().catch((e) => this.logger.error(`Falha no envio em segundo plano: ${e?.message ?? e}`));
  }

  private async findOrFail(id: string) {
    const process = await LegalProcessEntity.findOne({
      where: { id },
      relations: { client: true, steps: true },
      order: { steps: { position: 'ASC' } },
    });
    if (!process) throw new NotFoundException('Processo não encontrado');
    return process;
  }

  private toResponse(process: LegalProcessEntity) {
    const steps = [...(process.steps ?? [])].sort((a, b) => a.position - b.position);
    const done = steps.filter((s) => s.done).length;

    return {
      id: process.id,
      type: process.type,
      title: process.title,
      description: process.description,
      status: process.status,
      expectedEndDate: process.expectedEndDate,
      finishedAt: process.finishedAt,
      createdAt: process.createdAt,
      client: { id: process.client.id, name: process.client.name, cnpj: process.client.cnpj },
      progress: { done, total: steps.length },
      steps: steps.map((s) => ({
        id: s.id,
        position: s.position,
        name: s.name,
        done: s.done,
        doneAt: s.doneAt,
        notes: s.notes,
      })),
    };
  }

  private async notifyStepDone(
    process: LegalProcessEntity,
    step: LegalProcessStepEntity,
    finished: boolean,
  ) {
    const email = process.client.responsibleEmail;
    if (!email || !this.mailService.isConfigured()) return;

    const done = process.steps.filter((s) => s.done).length;
    const label = TYPE_LABELS[process.type] ?? 'Processo';

    try {
      await this.mailService.send({
        to: email,
        subject: finished
          ? `${label} concluída - ${process.client.name}`
          : `Andamento: ${step.name} - ${process.client.name}`,
        html: renderMailLayout(
          finished ? 'Processo concluído' : 'Nova etapa concluída',
          `<p>Olá,</p>
           <p>O processo <strong>${escapeHtml(process.title)}</strong> da empresa <strong>${escapeHtml(process.client.name)}</strong> avançou:</p>
           <p style="font-size:16px;">✔ ${escapeHtml(step.name)}</p>
           ${step.notes ? `<p style="color:#6b7a73;">${escapeHtml(step.notes)}</p>` : ''}
           <p>${finished ? 'Todas as etapas foram concluídas.' : `Progresso: ${done} de ${process.steps.length} etapas concluídas.`}</p>`,
        ),
      });
    } catch (e: any) {
      this.logger.error(`Falha ao avisar ${email} sobre o processo ${process.id}: ${e.message}`);
    }
  }
}
