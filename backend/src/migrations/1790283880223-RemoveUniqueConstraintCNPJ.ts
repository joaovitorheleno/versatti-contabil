import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUniqueConstraintCNPJ1790283880223 implements MigrationInterface {
    name = 'RemoveUniqueConstraintCNPJ1790283880223'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT "UQ_c2528f5ea78df3e939950b861c0"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clients" ADD CONSTRAINT "UQ_c2528f5ea78df3e939950b861c0" UNIQUE ("cnpj")`);
    }

}
