import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTickets1792024920929 implements MigrationInterface {
    name = 'CreateTickets1792024920929'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tickets_category_enum" AS ENUM('ADMISSAO', 'DEMISSAO', 'FERIAS', 'FOLHA', 'FISCAL', 'CONTABIL', 'SOCIETARIO', 'CERTIDOES', 'OUTROS')`);
        await queryRunner.query(`CREATE TYPE "public"."tickets_priority_enum" AS ENUM('BAIXA', 'NORMAL', 'ALTA', 'URGENTE')`);
        await queryRunner.query(`CREATE TYPE "public"."tickets_status_enum" AS ENUM('ABERTO', 'EM_ATENDIMENTO', 'AGUARDANDO_CLIENTE', 'RESOLVIDO', 'FECHADO')`);
        await queryRunner.query(`CREATE TABLE "tickets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "createdBy" character varying, "updatedBy" character varying, "deletedBy" character varying, "number" SERIAL NOT NULL, "subject" character varying(200) NOT NULL, "category" "public"."tickets_category_enum" NOT NULL, "priority" "public"."tickets_priority_enum" NOT NULL DEFAULT 'NORMAL', "status" "public"."tickets_status_enum" NOT NULL DEFAULT 'ABERTO', "last_message_at" TIMESTAMP NOT NULL DEFAULT now(), "client_id" uuid NOT NULL, "opened_by_id" uuid NOT NULL, CONSTRAINT "UQ_78e08cc1101fc17f77c6f11b4c7" UNIQUE ("number"), CONSTRAINT "PK_343bc942ae261cf7a1377f48fd0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ticket_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "createdBy" character varying, "updatedBy" character varying, "deletedBy" character varying, "from_office" boolean NOT NULL DEFAULT false, "body" text NOT NULL, "file_key" character varying(500), "file_name" character varying(255), "file_mime" character varying(100), "file_size" bigint, "ticket_id" uuid NOT NULL, "author_id" uuid NOT NULL, CONSTRAINT "PK_37beb692dedf7eccb4e519ccec1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_ab0f4c7161f0a5c178d229e3541" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_4acc19dd235399f5b21216a01fa" FOREIGN KEY ("opened_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket_messages" ADD CONSTRAINT "FK_75b3a5f421dbf7b73778da519cb" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket_messages" ADD CONSTRAINT "FK_f4bb678401a3375965ddd013f94" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ticket_messages" DROP CONSTRAINT "FK_f4bb678401a3375965ddd013f94"`);
        await queryRunner.query(`ALTER TABLE "ticket_messages" DROP CONSTRAINT "FK_75b3a5f421dbf7b73778da519cb"`);
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_4acc19dd235399f5b21216a01fa"`);
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_ab0f4c7161f0a5c178d229e3541"`);
        await queryRunner.query(`DROP TABLE "ticket_messages"`);
        await queryRunner.query(`DROP TABLE "tickets"`);
        await queryRunner.query(`DROP TYPE "public"."tickets_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tickets_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tickets_category_enum"`);
    }

}
