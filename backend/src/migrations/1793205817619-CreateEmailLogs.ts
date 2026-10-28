import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmailLogs1793205817619 implements MigrationInterface {
    name = 'CreateEmailLogs1793205817619'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "email_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "provider_id" character varying(100), "to_email" character varying(255) NOT NULL, "subject" character varying(255) NOT NULL, "category" character varying(30) NOT NULL DEFAULT 'OTHER', "status" character varying(20) NOT NULL DEFAULT 'SENT', "client_id" character varying, "sent_by" character varying, "error" character varying(500), "delivered_at" TIMESTAMP, "opened_at" TIMESTAMP, "bounced_at" TIMESTAMP, CONSTRAINT "PK_999382218924e953a790d340571" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b63d8704c071cc763175edb157" ON "email_logs"  ("provider_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_8fa8c951a0652c1ec745d79492" ON "email_logs"  ("created_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_8fa8c951a0652c1ec745d79492"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b63d8704c071cc763175edb157"`);
        await queryRunner.query(`DROP TABLE "email_logs"`);
    }

}
