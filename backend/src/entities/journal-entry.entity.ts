import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { JournalSourceEnum } from '../enum/accounting.enum';
import { CrudEntity } from './abstract/crud-entity';
import { ClientEntity } from './client.entity';
import { JournalLineEntity } from './journal-line.entity';

@Entity('journal_entries')
@Index(['client', 'date'])
export class JournalEntryEntity extends CrudEntity {
  @ManyToOne(() => ClientEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client!: ClientEntity;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'varchar', length: 255 })
  description!: string;

  @Column({ type: 'enum', enum: JournalSourceEnum, default: JournalSourceEnum.MANUAL })
  source!: JournalSourceEnum;

  @OneToMany(() => JournalLineEntity, (line) => line.entry, { cascade: true })
  lines!: JournalLineEntity[];
}
