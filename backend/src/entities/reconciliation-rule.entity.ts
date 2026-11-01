import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { RuleDirectionEnum } from '../enum/accounting.enum';
import { CrudEntity } from './abstract/crud-entity';
import { AccountEntity } from './account.entity';
import { ClientEntity } from './client.entity';

@Entity('reconciliation_rules')
export class ReconciliationRuleEntity extends CrudEntity {
  @ManyToOne(() => ClientEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client!: ClientEntity;

  @Column({ type: 'varchar', length: 100 })
  keyword!: string;

  @Column({ type: 'enum', enum: RuleDirectionEnum, default: RuleDirectionEnum.ANY })
  direction!: RuleDirectionEnum;

  @ManyToOne(() => AccountEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: AccountEntity;
}
