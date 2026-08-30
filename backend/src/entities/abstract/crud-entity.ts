import { v4 as uuid } from 'uuid';
import { BaseEntity } from './base-entity';
import { Column } from 'typeorm';

export abstract class CrudEntity extends BaseEntity {
  constructor() {
    super();
    this.id = uuid();
  }

  @Column('varchar', { nullable: true })
  createdBy: string | undefined = undefined;

  @Column('varchar', { nullable: true })
  updatedBy: string | undefined = undefined;

  @Column('varchar', { nullable: true })
  deletedBy: string | undefined = undefined;

  set<T extends keyof this>(key: T, value?: this[T]) {
    if (value === undefined) return;
    if (typeof value === 'number' && isNaN(value)) return;
    this[key] = value;
  }
}