import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CrudEntity } from './abstract/crud-entity';
import { TicketEntity } from './ticket.entity';
import { UserEntity } from './user.entity';

@Entity('ticket_messages')
export class TicketMessageEntity extends CrudEntity {
  @ManyToOne(() => TicketEntity, (ticket) => ticket.messages, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ticket_id' })
  ticket!: TicketEntity;

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'author_id' })
  author!: UserEntity;

  @Column({ name: 'from_office', default: false })
  fromOffice!: boolean;

  @Column({ type: 'text' })
  body!: string;

  @Column({ name: 'file_key', type: 'varchar', length: 500, nullable: true })
  fileKey!: string | null;

  @Column({ name: 'file_name', type: 'varchar', length: 255, nullable: true })
  fileName!: string | null;

  @Column({ name: 'file_mime', type: 'varchar', length: 100, nullable: true })
  fileMime!: string | null;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize!: string | null;
}
