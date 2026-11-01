import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CrudEntity } from './abstract/crud-entity';
import { AccountEntity } from './account.entity';
import { JournalEntryEntity } from './journal-entry.entity';

@Entity('journal_lines')
export class JournalLineEntity extends CrudEntity {
  @ManyToOne(() => JournalEntryEntity, (entry) => entry.lines, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'entry_id' })
  entry!: JournalEntryEntity;

  @ManyToOne(() => AccountEntity, { nullable: false })
  @JoinColumn({ name: 'account_id' })
  account!: AccountEntity;

  @Column({ type: 'numeric', precision: 15, scale: 2, default: 0 })
  debit!: string;

  @Column({ type: 'numeric', precision: 15, scale: 2, default: 0 })
  credit!: string;
}
