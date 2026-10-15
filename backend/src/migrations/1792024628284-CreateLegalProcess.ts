import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLegalProcess1792024628284 implements MigrationInterface {
    name = 'CreateLegalProcess1792024628284'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."legal_processes_type_enum" AS ENUM('ABERTURA', 'ALTERACAO', 'BAIXA', 'OUTRO')`);
        await queryRunner.query(`CREATE TYPE "public"."legal_processes_status_enum" AS ENUM('EM_ANDAMENTO', 'AGUARDANDO_CLIENTE', 'CONCLUIDO', 'CANCELADO')`);
        await queryRunner.query(`CREATE TABLE "legal_processes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "createdBy" character varying, "updatedBy" character varying, "deletedBy" character varying, "type" "public"."legal_processes_type_enum" NOT NULL, "title" character varying(255) NOT NULL, "description" text, "status" "public"."legal_processes_status_enum" NOT NULL DEFAULT 'EM_ANDAMENTO', "expected_end_date" date, "finished_at" date, "client_id" uuid NOT NULL, CONSTRAINT "PK_49d8c975eb2bf442268cb8b93b0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "legal_process_steps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "createdBy" character varying, "updatedBy" character varying, "deletedBy" character varying, "position" integer NOT NULL, "name" character varying(255) NOT NULL, "done" boolean NOT NULL DEFAULT false, "done_at" date, "notes" text, "process_id" uuid NOT NULL, CONSTRAINT "PK_64cc5d9d807b3055673b3dcc0f3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "legal_processes" ADD CONSTRAINT "FK_d4df44d0adb0a64ce25ba2abd26" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "legal_process_steps" ADD CONSTRAINT "FK_d0ab89ff61204036209a325b18c" FOREIGN KEY ("process_id") REFERENCES "legal_processes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "legal_process_steps" DROP CONSTRAINT "FK_d0ab89ff61204036209a325b18c"`);
        await queryRunner.query(`ALTER TABLE "legal_processes" DROP CONSTRAINT "FK_d4df44d0adb0a64ce25ba2abd26"`);
        await queryRunner.query(`DROP TABLE "legal_process_steps"`);
        await queryRunner.query(`DROP TABLE "legal_processes"`);
        await queryRunner.query(`DROP TYPE "public"."legal_processes_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."legal_processes_type_enum"`);
    }

}
