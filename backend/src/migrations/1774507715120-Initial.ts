import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1774507715120 implements MigrationInterface {
    name = 'Initial1774507715120'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ai_results" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "scanId" uuid NOT NULL, "modelName" character varying(100) NOT NULL, "modelVersion" character varying(50), "predictions" jsonb, "confidenceScore" numeric(5,4), "resultData" jsonb, "processedAt" TIMESTAMP WITH TIME ZONE, "processingDurationMs" integer, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_c65603014e94bf65ea60ce5a721" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ec45a583cbdebb7b4af2e1e36b" ON "ai_results" ("scanId") `);
        await queryRunner.query(`CREATE TYPE "public"."scans_scantype_enum" AS ENUM('xray', 'ct', 'mri')`);
        await queryRunner.query(`CREATE TYPE "public"."scans_status_enum" AS ENUM('pending', 'uploading', 'uploaded', 'processing', 'processed', 'failed')`);
        await queryRunner.query(`CREATE TABLE "scans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "patientId" uuid NOT NULL, "scanType" "public"."scans_scantype_enum" NOT NULL, "s3Key" character varying(500), "s3Url" character varying(1000), "status" "public"."scans_status_enum" NOT NULL DEFAULT 'pending', "notes" text, "originalFileName" character varying(255), "fileSize" bigint, "mimeType" character varying(100), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_41156c08314b9e541c1cb18c588" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ff6265317daf6348828dc9663f" ON "scans" ("scanType") `);
        await queryRunner.query(`CREATE INDEX "IDX_acca8751876ba6c47bbc5fe5b5" ON "scans" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_7eda70d12828bfaece6126cfc1" ON "scans" ("patientId") `);
        await queryRunner.query(`CREATE TYPE "public"."patients_gender_enum" AS ENUM('male', 'female', 'other')`);
        await queryRunner.query(`CREATE TABLE "patients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" integer NOT NULL, "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "dateOfBirth" date, "gender" "public"."patients_gender_enum", "medicalRecordNumber" character varying(50) NOT NULL, "notes" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_b4af14305193deed7e9febb1603" UNIQUE ("medicalRecordNumber"), CONSTRAINT "PK_a7f0b9fcbb3469d5ec0b0aceaa7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b4af14305193deed7e9febb160" ON "patients" ("medicalRecordNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_2c24c3490a26d04b0d70f92057" ON "patients" ("userId") `);
        await queryRunner.query(`ALTER TABLE "ai_results" ADD CONSTRAINT "FK_ec45a583cbdebb7b4af2e1e36b3" FOREIGN KEY ("scanId") REFERENCES "scans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "scans" ADD CONSTRAINT "FK_7eda70d12828bfaece6126cfc17" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "FK_2c24c3490a26d04b0d70f92057a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_2c24c3490a26d04b0d70f92057a"`);
        await queryRunner.query(`ALTER TABLE "scans" DROP CONSTRAINT "FK_7eda70d12828bfaece6126cfc17"`);
        await queryRunner.query(`ALTER TABLE "ai_results" DROP CONSTRAINT "FK_ec45a583cbdebb7b4af2e1e36b3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2c24c3490a26d04b0d70f92057"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b4af14305193deed7e9febb160"`);
        await queryRunner.query(`DROP TABLE "patients"`);
        await queryRunner.query(`DROP TYPE "public"."patients_gender_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7eda70d12828bfaece6126cfc1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_acca8751876ba6c47bbc5fe5b5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ff6265317daf6348828dc9663f"`);
        await queryRunner.query(`DROP TABLE "scans"`);
        await queryRunner.query(`DROP TYPE "public"."scans_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."scans_scantype_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ec45a583cbdebb7b4af2e1e36b"`);
        await queryRunner.query(`DROP TABLE "ai_results"`);
    }

}
