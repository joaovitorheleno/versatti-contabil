import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmailLogBatch1793740000000 implements MigrationInterface {
    name = 'AddEmailLogBatch1793740000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email_logs" ADD "batch_id" uuid`);
        await queryRunner.query(`CREATE INDEX "IDX_email_logs_batch_id" ON "email_logs" ("batch_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_email_logs_batch_id"`);
        await queryRunner.query(`ALTER TABLE "email_logs" DROP COLUMN "batch_id"`);
    }

}
