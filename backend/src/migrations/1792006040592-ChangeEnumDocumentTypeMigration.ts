import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeEnumDocumentTypeMigration1792006040592 implements MigrationInterface {
    name = 'ChangeEnumDocumentTypeMigration1792006040592'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."document_types_category_enum" RENAME TO "document_types_category_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."document_types_category_enum" AS ENUM('SOCIETARIO', 'LICENCAS', 'CERTIDOES', 'CERTIFICADO_DIGITAL', 'FISCAL', 'TRABALHISTA', 'CONTABIL', 'OUTROS')`);
        await queryRunner.query(`ALTER TABLE "document_types" ALTER COLUMN "category" TYPE "public"."document_types_category_enum" USING "category"::"text"::"public"."document_types_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."document_types_category_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."document_types_category_enum_old" AS ENUM('ALVARA', 'LICENCA_BOMBEIROS', 'LICENCA_SANITARIA', 'CND_FEDERAL', 'CND_ESTADUAL', 'CND_MUNICIPAL', 'CRF_FGTS', 'CNDT', 'CERT_ECNPJ', 'CERT_ECPF', 'CONTRATO_SOCIAL', 'ALTERACAO_CONTRATUAL', 'ATA', 'OUTRO')`);
        await queryRunner.query(`ALTER TABLE "document_types" ALTER COLUMN "category" TYPE "public"."document_types_category_enum_old" USING "category"::"text"::"public"."document_types_category_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."document_types_category_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."document_types_category_enum_old" RENAME TO "document_types_category_enum"`);
    }

}
