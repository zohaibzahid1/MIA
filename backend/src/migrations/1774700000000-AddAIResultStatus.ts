import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAIResultStatus1774700000000 implements MigrationInterface {
  name = 'AddAIResultStatus1774700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."ai_results_status_enum" AS ENUM('pending', 'completed', 'failed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_results" ADD "status" "public"."ai_results_status_enum" NOT NULL DEFAULT 'pending'`,
    );

    await queryRunner.query(
      `UPDATE "ai_results" SET "status" = 'completed' WHERE "processedAt" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ai_results" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."ai_results_status_enum"`);
  }
}
