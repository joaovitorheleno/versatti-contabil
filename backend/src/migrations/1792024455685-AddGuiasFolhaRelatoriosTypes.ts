import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGuiasFolhaRelatoriosTypes1792024455685 implements MigrationInterface {
    name = 'AddGuiasFolhaRelatoriosTypes1792024455685'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."document_types_code_enum" ADD VALUE 'GUIA_DAS'`);
        await queryRunner.query(`ALTER TYPE "public"."document_types_code_enum" ADD VALUE 'GUIA_DARF'`);
        await queryRunner.query(`ALTER TYPE "public"."document_types_code_enum" ADD VALUE 'GUIA_FGTS'`);
        await queryRunner.query(`ALTER TYPE "public"."document_types_code_enum" ADD VALUE 'GUIA_ISS'`);
        await queryRunner.query(`ALTER TYPE "public"."document_types_code_enum" ADD VALUE 'GUIA_ICMS'`);
        await queryRunner.query(`ALTER TYPE "public"."document_types_code_enum" ADD VALUE 'FOLHA_PAGAMENTO'`);
        await queryRunner.query(`ALTER TYPE "public"."document_types_code_enum" ADD VALUE 'HOLERITE'`);
        await queryRunner.query(`ALTER TYPE "public"."document_types_code_enum" ADD VALUE 'BALANCETE'`);
        await queryRunner.query(`ALTER TYPE "public"."document_types_code_enum" ADD VALUE 'BALANCO_DRE'`);
        await queryRunner.query(`ALTER TYPE "public"."document_types_category_enum" ADD VALUE 'GUIAS'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."document_types_category_enum_old" AS ENUM('SOCIETARIO', 'LICENCAS', 'CERTIDOES', 'CERTIFICADO_DIGITAL', 'FISCAL', 'TRABALHISTA', 'CONTABIL', 'OUTROS')`);
        await queryRunner.query(`ALTER TABLE "document_types" ALTER COLUMN "category" TYPE "public"."document_types_category_enum_old" USING "category"::"text"::"public"."document_types_category_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."document_types_category_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."document_types_category_enum_old" RENAME TO "document_types_category_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."document_types_code_enum_old" AS ENUM('ALVARA', 'LICENCA_BOMBEIROS', 'LICENCA_SANITARIA', 'CND_FEDERAL', 'CND_ESTADUAL', 'CND_MUNICIPAL', 'CRF_FGTS', 'CNDT', 'CERT_ECNPJ', 'CERT_ECPF', 'CONTRATO_SOCIAL', 'ALTERACAO_CONTRATUAL', 'ATA', 'OUTRO', 'NFE_ENTRADA', 'NFE_SAIDA', 'NFCE', 'NFSE', 'CTE')`);
        await queryRunner.query(`ALTER TABLE "document_types" ALTER COLUMN "code" TYPE "public"."document_types_code_enum_old" USING "code"::"text"::"public"."document_types_code_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."document_types_code_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."document_types_code_enum_old" RENAME TO "document_types_code_enum"`);
    }

}
