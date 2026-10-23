import { MigrationInterface, QueryRunner } from "typeorm";

export class MunicipalRegistrationRequired1792778635121 implements MigrationInterface {
    name = 'MunicipalRegistrationRequired1792778635121'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE "clients" SET "municipal_registration" = 'ISENTO' WHERE "municipal_registration" IS NULL`);
        await queryRunner.query(`ALTER TABLE "clients" ALTER COLUMN "municipal_registration" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clients" ALTER COLUMN "municipal_registration" DROP NOT NULL`);
    }

}
