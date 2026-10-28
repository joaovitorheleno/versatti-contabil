import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  EmailCategoryEnum,
  EmailStatusEnum,
} from '../enum/email-log.enum';

@Entity('email_logs')
@Index(['createdAt'])
@Index(['providerId'])
export class EmailLogEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'provider_id', type: 'varchar', length: 100, nullable: true })
  providerId!: string | null;

  @Column({ name: 'to_email', type: 'varchar', length: 255 })
  toEmail!: string;

  @Column({ type: 'varchar', length: 255 })
  subject!: string;

  @Column({ type: 'varchar', length: 30, default: EmailCategoryEnum.OTHER })
  category!: EmailCategoryEnum;

  @Column({ type: 'varchar', length: 20, default: EmailStatusEnum.SENT })
  status!: EmailStatusEnum;

  @Column({ name: 'client_id', type: 'varchar', nullable: true })
  clientId!: string | null;

  @Column({ name: 'sent_by', type: 'varchar', nullable: true })
  sentBy!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  error!: string | null;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt!: Date | null;

  @Column({ name: 'opened_at', type: 'timestamp', nullable: true })
  openedAt!: Date | null;

  @Column({ name: 'bounced_at', type: 'timestamp', nullable: true })
  bouncedAt!: Date | null;
}
