import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { CrudEntity } from './abstract/crud-entity';
import { UserRole } from '../enum/user-role.enum';
import { ClientEntity } from './client.entity';
import { UserClientEntity } from './user-client.entity';

@Entity('users')
export class UserEntity extends CrudEntity {
  @Column('varchar', { nullable: false })
  name!: string;

  @Column('varchar', { nullable: false, unique: true })
  email!: string;

  @Column('varchar', { nullable: false, unique: true })
  cpf!: string;

  @Column('varchar', { nullable: true, unique: true })
  phone?: string;

  @Column('varchar', { nullable: true })
  password?: string | undefined;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.DEFAULT })
  role!: UserRole;

  @Column({ name: 'terms_accepted_at', type: 'timestamp', nullable: true })
  termsAcceptedAt!: Date | null;

  @Column({
    name: 'terms_version',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  termsVersion!: string | null;

  @OneToMany(() => UserClientEntity, (userClient) => userClient.user)
  userClients!: UserClientEntity[];
}
