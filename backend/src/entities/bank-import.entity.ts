import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CrudEntity } from './abstract/crud-entity';
import { AccountEntity } from './account.entity';
import { ClientEntity } from './client.entity';

@Entity('bank_imports')
export class BankImportEntity extends CrudEntity {
  @ManyToOne(() => ClientEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client!: ClientEntity;

  @ManyToOne(() => AccountEntity, { nullable: false })
  @JoinColumn({ name: 'bank_account_id' })
  bankAccount!: AccountEntity;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName!: string;

  @Column({ type: 'varchar', length: 10 })
  format!: string;

  @Column({ name: 'imported_count', type: 'int', default: 0 })
  importedCount!: number;

  @Column({ name: 'duplicate_count', type: 'int', default: 0 })
  duplicateCount!: number;
}
