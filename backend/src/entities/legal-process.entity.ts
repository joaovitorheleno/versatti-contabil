import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import {
  LegalProcessStatusEnum,
  LegalProcessTypeEnum,
} from '../enum/legal-process.enum';
import { CrudEntity } from './abstract/crud-entity';
import { ClientEntity } from './client.entity';
import { LegalProcessStepEntity } from './legal-process-step.entity';

@Entity('legal_processes')
export class LegalProcessEntity extends CrudEntity {
  @ManyToOne(() => ClientEntity, { nullable: false })
  @JoinColumn({ name: 'client_id' })
  client!: ClientEntity;

  @Column({ type: 'enum', enum: LegalProcessTypeEnum })
  type!: LegalProcessTypeEnum;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    type: 'enum',
    enum: LegalProcessStatusEnum,
    default: LegalProcessStatusEnum.EM_ANDAMENTO,
  })
  status!: LegalProcessStatusEnum;

  @Column({ name: 'expected_end_date', type: 'date', nullable: true })
  expectedEndDate!: string | null;

  @Column({ name: 'finished_at', type: 'date', nullable: true })
  finishedAt!: string | null;

  @OneToMany(() => LegalProcessStepEntity, (step) => step.process, {
    cascade: true,
  })
  steps!: LegalProcessStepEntity[];
}
