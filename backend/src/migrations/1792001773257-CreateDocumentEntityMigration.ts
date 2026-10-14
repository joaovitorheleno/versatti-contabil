import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDocumentEntityMigration1792001773257 implements MigrationInterface {
    name = 'CreateDocumentEntityMigration1792001773257'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "createdBy" character varying, "updatedBy" character varying, "deletedBy" character varying, "title" character varying(255) NOT NULL, "number" character varying(100), "notes" text, "issue_date" date, "expiration_date" date, "alert_days" integer, "last_alert_at" date, "file_key" character varying(500), "file_name" character varying(255), "file_mime" character varying(100), "file_size" bigint, "active" boolean NOT NULL DEFAULT true, "visible_to_client" boolean NOT NULL DEFAULT true, "id_client" uuid NOT NULL, "document_type_id" uuid NOT NULL, "replaces_id" uuid, CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."document_types_code_enum" AS ENUM('ALVARA', 'LICENCA_BOMBEIROS', 'LICENCA_SANITARIA', 'CND_FEDERAL', 'CND_ESTADUAL', 'CND_MUNICIPAL', 'CRF_FGTS', 'CNDT', 'CERT_ECNPJ', 'CERT_ECPF', 'CONTRATO_SOCIAL', 'ALTERACAO_CONTRATUAL', 'ATA', 'OUTRO')`);
        await queryRunner.query(`CREATE TYPE "public"."document_types_category_enum" AS ENUM('ALVARA', 'LICENCA_BOMBEIROS', 'LICENCA_SANITARIA', 'CND_FEDERAL', 'CND_ESTADUAL', 'CND_MUNICIPAL', 'CRF_FGTS', 'CNDT', 'CERT_ECNPJ', 'CERT_ECPF', 'CONTRATO_SOCIAL', 'ALTERACAO_CONTRATUAL', 'ATA', 'OUTRO')`);
        await queryRunner.query(`CREATE TABLE "document_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "createdBy" character varying, "updatedBy" character varying, "deletedBy" character varying, "code" "public"."document_types_code_enum" NOT NULL, "name" character varying(100) NOT NULL, "category" "public"."document_types_category_enum" NOT NULL, "requires_expiration" boolean NOT NULL DEFAULT false, "default_alert_days" integer, "active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_5c46cecbae576329e689110cbb5" UNIQUE ("code"), CONSTRAINT "PK_d467d7eeb7c8ce216e90e8494aa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_b67c3b0aa2df3080874ce8a47dc" FOREIGN KEY ("id_client") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_5e174bbf5fb523874f836c425e9" FOREIGN KEY ("document_type_id") REFERENCES "document_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_9bdc0d472a50a65185d4d2c434c" FOREIGN KEY ("replaces_id") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_9bdc0d472a50a65185d4d2c434c"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_5e174bbf5fb523874f836c425e9"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_b67c3b0aa2df3080874ce8a47dc"`);
        await queryRunner.query(`DROP TABLE "document_types"`);
        await queryRunner.query(`DROP TYPE "public"."document_types_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."document_types_code_enum"`);
        await queryRunner.query(`DROP TABLE "documents"`);
    }

}
