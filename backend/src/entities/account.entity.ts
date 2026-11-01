import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AccountTypeEnum } from '../enum/accounting.enum';
import { CrudEntity } from './abstract/crud-entity';
import { ClientEntity } from './client.entity';

@Entity('accounts')
@Index(['client', 'code'])
export class AccountEntity extends CrudEntity {
  @ManyToOne(() => ClientEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client!: ClientEntity;

  @Column({ type: 'varchar', length: 30 })
  code!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'enum', enum: AccountTypeEnum })
  type!: AccountTypeEnum;

  @Column({ default: true })
  analytic!: boolean;

  @Column({ default: true })
  active!: boolean;
}
