import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAccounting1793560000000 implements MigrationInterface {
    name = 'CreateAccounting1793560000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."accounts_type_enum" AS ENUM('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')`);
        await queryRunner.query(`CREATE TABLE "accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "createdBy" character varying, "updatedBy" character varying, "deletedBy" character varying, "code" character varying(30) NOT NULL, "name" character varying(150) NOT NULL, "type" "public"."accounts_type_enum" NOT NULL, "analytic" boolean NOT NULL DEFAULT true, "active" boolean NOT NULL DEFAULT true, "client_id" uuid NOT NULL, CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7c37199a41dc3b304247848f3a" ON "accounts" ("client_id", "code") `);

        await queryRunner.query(`CREATE TYPE "public"."journal_entries_source_enum" AS ENUM('MANUAL', 'BANK')`);
        await queryRunner.query(`CREATE TABLE "journal_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "createdBy" character varying, "updatedBy" character varying, "deletedBy" character varying, "date" date NOT NULL, "description" character varying(255) NOT NULL, "source" "public"."journal_entries_source_enum" NOT NULL DEFAULT 'MANUAL', "client_id" uuid NOT NULL, CONSTRAINT "PK_a70368e64230434457c8d007ab3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_973bd5334e1ec94dd002f1c89d" ON "journal_entries" ("client_id", "date") `);

        await queryRunner.query(`CREATE TABLE "journal_lines" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "createdBy" character varying, "updatedBy" character varying, "deletedBy" character varying, "debit" numeric(15,2) NOT NULL DEFAULT '0', "credit" numeric(15,2) NOT NULL DEFAULT '0', "entry_id" uuid NOT NULL, "account_id" uuid NOT NULL, CONSTRAINT "PK_70cba2da4588cee8921f73ef136" PRIMARY KEY ("id"))`);

        await queryRunner.query(`CREATE TABLE "bank_imports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "createdBy" character varying, "updatedBy" character varying, "deletedBy" character varying, "file_name" character varying(255) NOT NULL, "format" character varying(10) NOT NULL, "imported_count" integer NOT NULL DEFAULT '0', "duplicate_count" integer NOT NULL DEFAULT '0', "client_id" uuid NOT NULL, "bank_account_id" uuid NOT NULL, CONSTRAINT "PK_f216dc7fa4e4fdd928b6416a9ff" PRIMARY KEY ("id"))`);

        await queryRunner.query(`CREATE TYPE "public"."bank_transactions_status_enum" AS ENUM('PENDING', 'RECONCILED', 'IGNORED')`);
        await queryRunner.query(`CREATE TABLE "bank_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "createdBy" character varying, "updatedBy" character varying, "deletedBy" character varying, "date" date NOT NULL, "amount" numeric(15,2) NOT NULL, "description" character varying(255) NOT NULL, "fitid" character varying(120) NOT NULL, "status" "public"."bank_transactions_status_enum" NOT NULL DEFAULT 'PENDING', "client_id" uuid NOT NULL, "bank_account_id" uuid NOT NULL, "import_id" uuid, "suggested_account_id" uuid, "journal_entry_id" uuid, CONSTRAINT "PK_123cc87304eefb2c497b4acdd10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ecde731d9b167fdd8b1861a32b" ON "bank_transactions" ("bank_account_id", "fitid") `);
        await queryRunner.query(`CREATE INDEX "IDX_fba9ef2d00412afd5401e78dac" ON "bank_transactions" ("client_id", "date") `);

        await queryRunner.query(`CREATE TYPE "public"."reconciliation_rules_direction_enum" AS ENUM('ANY', 'IN', 'OUT')`);
        await queryRunner.query(`CREATE TABLE "reconciliation_rules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "createdBy" character varying, "updatedBy" character varying, "deletedBy" character varying, "keyword" character varying(100) NOT NULL, "direction" "public"."reconciliation_rules_direction_enum" NOT NULL DEFAULT 'ANY', "client_id" uuid NOT NULL, "account_id" uuid NOT NULL, CONSTRAINT "PK_fb139a5cb0c76cc3750f2da94eb" PRIMARY KEY ("id"))`);

        await queryRunner.query(`CREATE TYPE "public"."period_closings_type_enum" AS ENUM('MONTH', 'QUARTER', 'YEAR')`);
        await queryRunner.query(`CREATE TABLE "period_closings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "createdBy" character varying, "updatedBy" character varying, "deletedBy" character varying, "type" "public"."period_closings_type_enum" NOT NULL, "reference" character varying(10) NOT NULL, "period_start" date NOT NULL, "period_end" date NOT NULL, "client_id" uuid NOT NULL, CONSTRAINT "PK_d18fa0f7d70e15942ccb30642be" PRIMARY KEY ("id"))`);

        await queryRunner.query(`ALTER TABLE "accounts" ADD CONSTRAINT "FK_099611aae88727aaa8369983f02" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "journal_entries" ADD CONSTRAINT "FK_3fff58906b66d4a26bd09ef7b8c" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "journal_lines" ADD CONSTRAINT "FK_60c0a30917e02e8316dbdf763e0" FOREIGN KEY ("entry_id") REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "journal_lines" ADD CONSTRAINT "FK_46bed88ea929e6f0aa17bf20845" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bank_imports" ADD CONSTRAINT "FK_efc911336098a67cb1842d023b0" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bank_imports" ADD CONSTRAINT "FK_57c107935bc3e0d6693f16ee217" FOREIGN KEY ("bank_account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bank_transactions" ADD CONSTRAINT "FK_1c7f989d4a181cc3467af9c756e" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bank_transactions" ADD CONSTRAINT "FK_e341239e38ae297bc9e151c26a7" FOREIGN KEY ("bank_account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bank_transactions" ADD CONSTRAINT "FK_c7f56001c8a256407511a5a75f9" FOREIGN KEY ("import_id") REFERENCES "bank_imports"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bank_transactions" ADD CONSTRAINT "FK_1e980a4f8e7251c06de5cfb74e3" FOREIGN KEY ("suggested_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bank_transactions" ADD CONSTRAINT "FK_4571c9320ee06917bc73038c034" FOREIGN KEY ("journal_entry_id") REFERENCES "journal_entries"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reconciliation_rules" ADD CONSTRAINT "FK_cac0c9276b941d51b570c074ca7" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reconciliation_rules" ADD CONSTRAINT "FK_485a507acc705c81bf75066e042" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "period_closings" ADD CONSTRAINT "FK_73a8587f43084ba85fc27620949" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "period_closings" DROP CONSTRAINT "FK_73a8587f43084ba85fc27620949"`);
        await queryRunner.query(`ALTER TABLE "reconciliation_rules" DROP CONSTRAINT "FK_485a507acc705c81bf75066e042"`);
        await queryRunner.query(`ALTER TABLE "reconciliation_rules" DROP CONSTRAINT "FK_cac0c9276b941d51b570c074ca7"`);
        await queryRunner.query(`ALTER TABLE "bank_transactions" DROP CONSTRAINT "FK_4571c9320ee06917bc73038c034"`);
        await queryRunner.query(`ALTER TABLE "bank_transactions" DROP CONSTRAINT "FK_1e980a4f8e7251c06de5cfb74e3"`);
        await queryRunner.query(`ALTER TABLE "bank_transactions" DROP CONSTRAINT "FK_c7f56001c8a256407511a5a75f9"`);
        await queryRunner.query(`ALTER TABLE "bank_transactions" DROP CONSTRAINT "FK_e341239e38ae297bc9e151c26a7"`);
        await queryRunner.query(`ALTER TABLE "bank_transactions" DROP CONSTRAINT "FK_1c7f989d4a181cc3467af9c756e"`);
        await queryRunner.query(`ALTER TABLE "bank_imports" DROP CONSTRAINT "FK_57c107935bc3e0d6693f16ee217"`);
        await queryRunner.query(`ALTER TABLE "bank_imports" DROP CONSTRAINT "FK_efc911336098a67cb1842d023b0"`);
        await queryRunner.query(`ALTER TABLE "journal_lines" DROP CONSTRAINT "FK_46bed88ea929e6f0aa17bf20845"`);
        await queryRunner.query(`ALTER TABLE "journal_lines" DROP CONSTRAINT "FK_60c0a30917e02e8316dbdf763e0"`);
        await queryRunner.query(`ALTER TABLE "journal_entries" DROP CONSTRAINT "FK_3fff58906b66d4a26bd09ef7b8c"`);
        await queryRunner.query(`ALTER TABLE "accounts" DROP CONSTRAINT "FK_099611aae88727aaa8369983f02"`);
        await queryRunner.query(`DROP TABLE "period_closings"`);
        await queryRunner.query(`DROP TYPE "public"."period_closings_type_enum"`);
        await queryRunner.query(`DROP TABLE "reconciliation_rules"`);
        await queryRunner.query(`DROP TYPE "public"."reconciliation_rules_direction_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fba9ef2d00412afd5401e78dac"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ecde731d9b167fdd8b1861a32b"`);
        await queryRunner.query(`DROP TABLE "bank_transactions"`);
        await queryRunner.query(`DROP TYPE "public"."bank_transactions_status_enum"`);
        await queryRunner.query(`DROP TABLE "bank_imports"`);
        await queryRunner.query(`DROP TABLE "journal_lines"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_973bd5334e1ec94dd002f1c89d"`);
        await queryRunner.query(`DROP TABLE "journal_entries"`);
        await queryRunner.query(`DROP TYPE "public"."journal_entries_source_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7c37199a41dc3b304247848f3a"`);
        await queryRunner.query(`DROP TABLE "accounts"`);
        await queryRunner.query(`DROP TYPE "public"."accounts_type_enum"`);
    }

}
