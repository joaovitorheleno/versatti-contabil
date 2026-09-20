import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovePasswordClientMigration1789662229774 implements MigrationInterface {
    name = 'RemovePasswordClientMigration1789662229774'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "password"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clients" ADD "password" character varying NOT NULL`);
    }

}
