import { MigrationInterface, QueryRunner } from "typeorm";

export class CpfIsNullableMigration1795471696708 implements MigrationInterface {
    name = 'CpfIsNullableMigration1795471696708'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "cpf" DROP NOT NULL`);
        await queryRunner.query(`UPDATE "users" SET "cpf" = NULL WHERE "cpf" = ''`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL`);
        await queryRunner.query(`UPDATE "users" SET "phone" = NULL WHERE "phone" = ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "cpf" SET NOT NULL`);
    }

}
