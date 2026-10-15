import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CrudEntity } from './abstract/crud-entity';
import { LegalProcessEntity } from './legal-process.entity';

@Entity('legal_process_steps')
export class LegalProcessStepEntity extends CrudEntity {
  @ManyToOne(() => LegalProcessEntity, (process) => process.steps, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'process_id' })
  process!: LegalProcessEntity;

  @Column({ type: 'int' })
  position!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ default: false })
  done!: boolean;

  @Column({ name: 'done_at', type: 'date', nullable: true })
  doneAt!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;
}
