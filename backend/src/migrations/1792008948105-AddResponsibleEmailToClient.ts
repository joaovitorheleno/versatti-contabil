import { MigrationInterface, QueryRunner } from "typeorm";

export class AddResponsibleEmailToClient1792008948105 implements MigrationInterface {
    name = 'AddResponsibleEmailToClient1792008948105'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clients" ADD "responsible_email" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "responsible_email"`);
    }

}
