import { MigrationInterface, QueryRunner } from "typeorm";

export class PasswordIsOptional1788371743399 implements MigrationInterface {
    name = 'PasswordIsOptional1788371743399'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`);
    }

}
