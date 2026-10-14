import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotaFiscalDocumentTypes1792007833416 implements MigrationInterface {
    name = 'AddNotaFiscalDocumentTypes1792007833416'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."document_types_code_enum" ADD VALUE 'NFE_ENTRADA'`);
        await queryRunner.query(`ALTER TYPE "public"."document_types_code_enum" ADD VALUE 'NFE_SAIDA'`);
        await queryRunner.query(`ALTER TYPE "public"."document_types_code_enum" ADD VALUE 'NFCE'`);
        await queryRunner.query(`ALTER TYPE "public"."document_types_code_enum" ADD VALUE 'NFSE'`);
        await queryRunner.query(`ALTER TYPE "public"."document_types_code_enum" ADD VALUE 'CTE'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."document_types_code_enum_old" AS ENUM('ALVARA', 'LICENCA_BOMBEIROS', 'LICENCA_SANITARIA', 'CND_FEDERAL', 'CND_ESTADUAL', 'CND_MUNICIPAL', 'CRF_FGTS', 'CNDT', 'CERT_ECNPJ', 'CERT_ECPF', 'CONTRATO_SOCIAL', 'ALTERACAO_CONTRATUAL', 'ATA', 'OUTRO')`);
        await queryRunner.query(`ALTER TABLE "document_types" ALTER COLUMN "code" TYPE "public"."document_types_code_enum_old" USING "code"::"text"::"public"."document_types_code_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."document_types_code_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."document_types_code_enum_old" RENAME TO "document_types_code_enum"`);
    }

}
