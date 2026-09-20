import { MigrationInterface, QueryRunner } from "typeorm";

export class UserClientRelationMigration1789528646632 implements MigrationInterface {
    name = 'UserClientRelationMigration1789528646632'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_client" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "createdBy" character varying, "updatedBy" character varying, "deletedBy" character varying, "user_id" uuid, "client_id" uuid, CONSTRAINT "PK_fed09e6f9c08a5031ba1e3e9701" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_client" ADD CONSTRAINT "FK_3805a53a60fd47fd34d59266cb7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_client" ADD CONSTRAINT "FK_fa3ae61f10325829f57c74b4863" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_client" DROP CONSTRAINT "FK_fa3ae61f10325829f57c74b4863"`);
        await queryRunner.query(`ALTER TABLE "user_client" DROP CONSTRAINT "FK_3805a53a60fd47fd34d59266cb7"`);
        await queryRunner.query(`DROP TABLE "user_client"`);
    }

}
