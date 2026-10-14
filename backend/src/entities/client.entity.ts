import { Column, Entity, OneToMany } from 'typeorm';
import { CrudEntity } from './abstract/crud-entity';
import { TaxRegimeEnum } from '../enum/tax-regime.enum';
import { UserClientEntity } from './user-client.entity';

@Entity('clients')
export class ClientEntity extends CrudEntity {
  @Column('varchar', { nullable: false })
  name!: string;

  @Column('varchar', { name: 'trade_name', nullable: true })
  tradeName?: string;

  @Column('varchar', { nullable: false, length: 14 })
  cnpj!: string;

  @Column('enum', { nullable: false, name: 'tax_regime', enum: TaxRegimeEnum })
  taxRegime!: TaxRegimeEnum;

  @Column('varchar', { name: 'state_registration', nullable: true })
  stateRegistration?: string;

  @Column('varchar', { name: 'municipal_registration', nullable: true })
  municipalRegistration?: string;

  @Column('varchar', { name: 'nfe_email', nullable: true })
  nfeEmail?: string;

  @Column('varchar', { nullable: false, length: 20 })
  phone!: string;

  @Column('varchar', { name: 'responsible_email', nullable: true })
  responsibleEmail?: string | null;

  @Column('varchar', { name: 'contact_person', nullable: true })
  contactPerson?: string;

  @Column('varchar', { name: 'zip_code', nullable: false, length: 8 })
  zipCode!: string;

  @Column('varchar', { nullable: false })
  street!: string;

  @Column('varchar', { nullable: false, length: 20 })
  number!: string;

  @Column('varchar', { nullable: true })
  complement?: string;

  @Column('varchar', { nullable: false })
  neighborhood!: string;

  @Column('varchar', { nullable: false })
  city!: string;

  @Column('varchar', { nullable: false, length: 2 })
  state!: string;

  @Column('boolean', { name: 'is_active', default: true })
  isActive!: boolean;

  @OneToMany(() => UserClientEntity, (userClient) => userClient.client)
  userClients!: UserClientEntity[];
}
