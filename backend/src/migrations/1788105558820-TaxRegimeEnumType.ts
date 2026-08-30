import { MigrationInterface, QueryRunner } from "typeorm";

export class TaxRegimeEnumType1788105558820 implements MigrationInterface {
    name = 'TaxRegimeEnumType1788105558820'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."clients_tax_regime_enum" AS ENUM('Simples Nacional', 'Lucro Presumido', 'Lucro Real')`);
        await queryRunner.query(`CREATE TABLE "clients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "createdBy" character varying, "updatedBy" character varying, "deletedBy" character varying, "name" character varying NOT NULL, "cnpj" character varying NOT NULL, "tax_regime" "public"."clients_tax_regime_enum" NOT NULL, CONSTRAINT "UQ_c2528f5ea78df3e939950b861c0" UNIQUE ("cnpj"), CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "createdBy" character varying, "updatedBy" character varying, "deletedBy" character varying, "name" character varying NOT NULL, "email" character varying NOT NULL, "cpf" character varying NOT NULL, "phone" character varying NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_230b925048540454c8b4c481e1c" UNIQUE ("cpf"), CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "clients"`);
        await queryRunner.query(`DROP TYPE "public"."clients_tax_regime_enum"`);
    }

}
