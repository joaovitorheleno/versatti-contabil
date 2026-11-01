import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ClosingTypeEnum } from '../enum/accounting.enum';
import { CrudEntity } from './abstract/crud-entity';
import { ClientEntity } from './client.entity';

@Entity('period_closings')
export class PeriodClosingEntity extends CrudEntity {
  @ManyToOne(() => ClientEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client!: ClientEntity;

  @Column({ type: 'enum', enum: ClosingTypeEnum })
  type!: ClosingTypeEnum;

  @Column({ type: 'varchar', length: 10 })
  reference!: string;

  @Column({ name: 'period_start', type: 'date' })
  periodStart!: string;

  @Column({ name: 'period_end', type: 'date' })
  periodEnd!: string;
}
