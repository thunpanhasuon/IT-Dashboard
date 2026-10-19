import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLoginAttemptsTable1792450000000
  implements MigrationInterface
{
  name = 'CreateLoginAttemptsTable1792450000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "login_attempts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(254) NOT NULL, "ip" character varying(64) NOT NULL, "attemptedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_login_attempts_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_login_attempts_email_attemptedAt" ON "login_attempts" ("email", "attemptedAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_login_attempts_ip_attemptedAt" ON "login_attempts" ("ip", "attemptedAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_login_attempts_ip_attemptedAt"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_login_attempts_email_attemptedAt"`,
    );
    await queryRunner.query(`DROP TABLE "login_attempts"`);
  }
}
