import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BaseEntity as TypeOrmBaseEntity,
} from 'typeorm';

export abstract class BaseEntity extends TypeOrmBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string = '';

  @CreateDateColumn()
  createdAt: Date = new Date();

  @UpdateDateColumn()
  updatedAt: Date = new Date();

  @DeleteDateColumn()
  deletedAt: Date | null = null;

  set<T extends keyof this>(key: T, value?: this[T]) {
    if (value === undefined) return;
    if (typeof value === 'number' && isNaN(value)) return;
    this[key] = value;
  }
}