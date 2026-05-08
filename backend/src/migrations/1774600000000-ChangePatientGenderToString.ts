import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePatientGenderToString1774600000000 implements MigrationInterface {
  name = 'ChangePatientGenderToString1774600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "patients" ALTER COLUMN "gender" TYPE character varying(20) USING "gender"::text`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."patients_gender_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."patients_gender_enum" AS ENUM('male', 'female', 'other')`);
    await queryRunner.query(`ALTER TABLE "patients" ALTER COLUMN "gender" TYPE "public"."patients_gender_enum" USING lower("gender")::"public"."patients_gender_enum"`);
  }
}
