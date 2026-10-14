import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveColumnDocumentEntityMigration1792001860694 implements MigrationInterface {
    name = 'RemoveColumnDocumentEntityMigration1792001860694'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_9bdc0d472a50a65185d4d2c434c"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN "replaces_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" ADD "replaces_id" uuid`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_9bdc0d472a50a65185d4d2c434c" FOREIGN KEY ("replaces_id") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
