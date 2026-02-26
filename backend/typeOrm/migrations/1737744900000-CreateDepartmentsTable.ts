import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDepartmentsTable1737744900000 implements MigrationInterface {
  name = 'CreateDepartmentsTable1737744900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure UUID extension exists
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE "departments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "code" character varying(50),
        "description" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_departments" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_departments_code" UNIQUE ("code")
      )
    `);

    // Index for optimized code searching
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_departments_code" ON "departments" ("code") 
      WHERE "code" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_departments_code"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "departments"`);
  }
}