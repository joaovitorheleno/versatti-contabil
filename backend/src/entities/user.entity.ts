import { Column, Entity } from "typeorm";
import { CrudEntity } from "./abstract/crud-entity";
import { UserRole } from "../enum/user-role.enum";

@Entity('users')
export class UserEntity extends CrudEntity {
    @Column('varchar', { nullable: false })
    name!: string;

    @Column('varchar', { nullable: false, unique: true })
    email!: string;

    @Column('varchar', { nullable: false, unique: true })
    cpf!: string;

    @Column('varchar', { nullable: false, unique: true })
    phone!: string;

    @Column('varchar', { nullable: true })
    password?: string | undefined;

    @Column({ type: 'date', name: 'date_of_birth' })
    dateOfBirth!: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.DEFAULT })
    role!: UserRole;
}