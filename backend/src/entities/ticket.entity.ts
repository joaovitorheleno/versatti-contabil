import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import {
  TicketCategoryEnum,
  TicketPriorityEnum,
  TicketStatusEnum,
} from '../enum/ticket.enum';
import { CrudEntity } from './abstract/crud-entity';
import { ClientEntity } from './client.entity';
import { TicketMessageEntity } from './ticket-message.entity';
import { UserEntity } from './user.entity';

@Entity('tickets')
export class TicketEntity extends CrudEntity {
  @Column({ type: 'int', generated: 'increment', unique: true })
  number!: number;

  @ManyToOne(() => ClientEntity, { nullable: false })
  @JoinColumn({ name: 'client_id' })
  client!: ClientEntity;

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'opened_by_id' })
  openedBy!: UserEntity;

  @Column({ type: 'varchar', length: 200 })
  subject!: string;

  @Column({ type: 'enum', enum: TicketCategoryEnum })
  category!: TicketCategoryEnum;

  @Column({ type: 'enum', enum: TicketPriorityEnum, default: TicketPriorityEnum.NORMAL })
  priority!: TicketPriorityEnum;

  @Column({ type: 'enum', enum: TicketStatusEnum, default: TicketStatusEnum.ABERTO })
  status!: TicketStatusEnum;

  @Column({ name: 'last_message_at', type: 'timestamp', default: () => 'now()' })
  lastMessageAt!: Date;

  @OneToMany(() => TicketMessageEntity, (message) => message.ticket, { cascade: true })
  messages!: TicketMessageEntity[];
}
