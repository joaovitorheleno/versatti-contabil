import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUserDateOfBirth1792781356675 implements MigrationInterface {
    name = 'RemoveUserDateOfBirth1792781356675'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "date_of_birth"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "date_of_birth" date`);
    }

}
