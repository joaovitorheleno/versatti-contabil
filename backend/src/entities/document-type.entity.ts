import { Entity, Column, OneToMany } from 'typeorm';
import { DocumentTypeEnum } from '../enum/document-type.enum';
import { DocumentCategoryEnum } from '../enum/document-category.enum';
import { DocumentEntity } from './documents.entity';
import { CrudEntity } from './abstract/crud-entity';

@Entity('document_types')
export class DocumentTypeEntity extends CrudEntity {
  @Column({ type: 'enum', enum: DocumentTypeEnum, unique: true })
  code!: DocumentTypeEnum;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'enum', enum: DocumentCategoryEnum })
  category!: DocumentCategoryEnum;

  @Column({ name: 'requires_expiration', default: false })
  requiresExpiration!: boolean;

  @Column({ name: 'default_alert_days', type: 'int', nullable: true })
  defaultAlertDays!: number | null;

  @Column({ default: true })
  active!: boolean;

  @OneToMany(() => DocumentEntity, (document) => document.documentType)
  documents!: DocumentEntity[];
}
