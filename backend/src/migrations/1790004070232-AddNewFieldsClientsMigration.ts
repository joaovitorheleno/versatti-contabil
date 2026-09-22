import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewFieldsClientsMigration1790004070232 implements MigrationInterface {
    name = 'AddNewFieldsClientsMigration1790004070232'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clients" ADD "trade_name" character varying`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "state_registration" character varying`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "municipal_registration" character varying`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "nfe_email" character varying`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "contact_person" character varying`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "complement" character varying`);

        await queryRunner.query(`ALTER TABLE "clients" ADD "phone" character varying(20) NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "zip_code" character varying(8) NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "street" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "number" character varying(20) NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "neighborhood" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "city" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "state" character varying(2) NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "is_active" boolean NOT NULL DEFAULT true`);

        await queryRunner.query(`ALTER TABLE "clients" ALTER COLUMN "phone" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "clients" ALTER COLUMN "zip_code" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "clients" ALTER COLUMN "street" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "clients" ALTER COLUMN "number" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "clients" ALTER COLUMN "neighborhood" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "clients" ALTER COLUMN "city" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "clients" ALTER COLUMN "state" DROP DEFAULT`);

        await queryRunner.query(`ALTER TABLE "clients" ALTER COLUMN "cnpj" TYPE character varying(14)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clients" ALTER COLUMN "cnpj" TYPE character varying`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "state"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "neighborhood"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "complement"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "number"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "street"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "zip_code"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "contact_person"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "nfe_email"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "municipal_registration"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "state_registration"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "trade_name"`);
    }
}