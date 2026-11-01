import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BankTransactionStatusEnum } from '../enum/accounting.enum';
import { CrudEntity } from './abstract/crud-entity';
import { AccountEntity } from './account.entity';
import { BankImportEntity } from './bank-import.entity';
import { ClientEntity } from './client.entity';
import { JournalEntryEntity } from './journal-entry.entity';

@Entity('bank_transactions')
@Index(['client', 'date'])
@Index(['bankAccount', 'fitid'])
export class BankTransactionEntity extends CrudEntity {
  @ManyToOne(() => ClientEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client!: ClientEntity;

  @ManyToOne(() => AccountEntity, { nullable: false })
  @JoinColumn({ name: 'bank_account_id' })
  bankAccount!: AccountEntity;

  @ManyToOne(() => BankImportEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'import_id' })
  import!: BankImportEntity | null;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  amount!: string;

  @Column({ type: 'varchar', length: 255 })
  description!: string;

  @Column({ type: 'varchar', length: 120 })
  fitid!: string;

  @Column({
    type: 'enum',
    enum: BankTransactionStatusEnum,
    default: BankTransactionStatusEnum.PENDING,
  })
  status!: BankTransactionStatusEnum;

  @ManyToOne(() => AccountEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'suggested_account_id' })
  suggestedAccount!: AccountEntity | null;

  @ManyToOne(() => JournalEntryEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'journal_entry_id' })
  journalEntry!: JournalEntryEntity | null;
}
