import { Entity, BaseEntity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { DocumentTypeEntity } from './document-type.entity';
import { ClientEntity } from './client.entity';
import { CrudEntity } from './abstract/crud-entity';

@Entity('documents')
export class DocumentEntity extends CrudEntity {
  @ManyToOne(() => ClientEntity, { nullable: false })
  @JoinColumn({ name: 'id_client' })
  client!: ClientEntity;

  @ManyToOne(() => DocumentTypeEntity, (type) => type.documents, {
    nullable: false,
  })
  @JoinColumn({ name: 'document_type_id' })
  documentType!: DocumentTypeEntity;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  number!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'issue_date', type: 'date', nullable: true })
  issueDate!: string | null;

  @Column({ name: 'expiration_date', type: 'date', nullable: true })
  expirationDate!: string | null;

  @Column({ name: 'alert_days', type: 'int', nullable: true })
  alertDays!: number | null;

  @Column({ name: 'last_alert_at', type: 'date', nullable: true })
  lastAlertAt!: string | null;

  @Column({ name: 'file_key', type: 'varchar', length: 500, nullable: true })
  fileKey!: string | null;

  @Column({ name: 'file_name', type: 'varchar', length: 255, nullable: true })
  fileName!: string | null;

  @Column({ name: 'file_mime', type: 'varchar', length: 100, nullable: true })
  fileMime!: string | null;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize!: string | null;

  @Column({ default: true })
  active!: boolean;

  @Column({ name: 'visible_to_client', default: true })
  visibleToClient!: boolean;
}
