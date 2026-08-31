import { Column, Entity } from "typeorm";
import { CrudEntity } from "./abstract/crud-entity";
import { TaxRegimeEnum } from '../enum/tax-regime.enum';

@Entity('clients')
export class ClientEntity extends CrudEntity {
    @Column('varchar', { nullable: false })
    name!: string;

    @Column('varchar', { nullable: false, unique: true })
    cnpj!: string;

    @Column('enum', { nullable: false, name: 'tax_regime', enum: TaxRegimeEnum })
    taxRegime!: TaxRegimeEnum;

    @Column('varchar', { nullable: false })
    password!: string;
}