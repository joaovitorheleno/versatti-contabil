import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPasswordColumnClient1788140838278 implements MigrationInterface {
    name = 'AddPasswordColumnClient1788140838278'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clients" ADD "password" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "password"`);
    }

}
