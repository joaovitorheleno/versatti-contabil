import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuditAndTerms1792025198538 implements MigrationInterface {
    name = 'CreateAuditAndTerms1792025198538'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('LOGIN', 'LOGIN_FAILED', 'DOCUMENT_UPLOAD', 'DOCUMENT_DOWNLOAD', 'TICKET_ATTACHMENT_DOWNLOAD', 'TERMS_ACCEPTED', 'PERSONAL_DATA_EXPORT')`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "action" "public"."audit_logs_action_enum" NOT NULL, "user_id" character varying, "client_id" character varying, "entity_id" character varying, "description" character varying(255), "ip" character varying(64), "user_agent" character varying(255), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bd2726fd31b35443f2245b93ba" ON "audit_logs"  ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_2cd10fda8276bb995288acfbfb" ON "audit_logs"  ("created_at") `);
        await queryRunner.query(`ALTER TABLE "users" ADD "terms_accepted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "terms_version" character varying(20)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "terms_version"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "terms_accepted_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2cd10fda8276bb995288acfbfb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bd2726fd31b35443f2245b93ba"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
    }

}
