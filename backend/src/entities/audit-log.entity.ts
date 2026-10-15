import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';
import { AuditActionEnum } from '../enum/audit-action.enum';

@Entity('audit_logs')
@Index(['createdAt'])
@Index(['userId'])
export class AuditLogEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'enum', enum: AuditActionEnum })
  action!: AuditActionEnum;

  @Column({ name: 'user_id', type: 'varchar', nullable: true })
  userId!: string | null;

  @Column({ name: 'client_id', type: 'varchar', nullable: true })
  clientId!: string | null;

  @Column({ name: 'entity_id', type: 'varchar', nullable: true })
  entityId!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  ip!: string | null;

  @Column({ name: 'user_agent', type: 'varchar', length: 255, nullable: true })
  userAgent!: string | null;
}
