import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewTaxRegimeMigration1790086518115 implements MigrationInterface {
    name = 'AddNewTaxRegimeMigration1790086518115'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."clients_tax_regime_enum" ADD VALUE 'MEI'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."clients_tax_regime_enum_old" AS ENUM('Simples Nacional', 'Lucro Presumido', 'Lucro Real')`);
        await queryRunner.query(`ALTER TABLE "clients" ALTER COLUMN "tax_regime" TYPE "public"."clients_tax_regime_enum_old" USING "tax_regime"::"text"::"public"."clients_tax_regime_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."clients_tax_regime_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."clients_tax_regime_enum_old" RENAME TO "clients_tax_regime_enum"`);
    }

}
