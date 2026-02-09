import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreateProjectsTable
 * 
 * Creates the projects table with all columns, enums, unique constraints, and foreign keys.
 */
export class CreateProjectsTable1770457595627 implements MigrationInterface {
  name = 'CreateProjectsTable1770457595627';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1️⃣ Create enum types
    await queryRunner.query(`
      CREATE TYPE "public"."projects_project_type_enum" AS ENUM('Website', 'App', 'CRM', 'Internal')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."projects_status_enum" AS ENUM('Draft', 'Active', 'Completed', 'Archived')
    `);

    // 2️⃣ UUID extension
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    `);

    // 3️⃣ Create projects table
    await queryRunner.query(`
      CREATE TABLE "projects" (
        "project_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "project_name" character varying(150) NOT NULL,
        "project_code" character varying(50) NOT NULL,
        "client_id" uuid NOT NULL,
        "project_type" "public"."projects_project_type_enum" NOT NULL,
        "project_description" text,
        "status" "public"."projects_status_enum" NOT NULL DEFAULT 'Draft',
        "start_date" date NOT NULL,
        "end_date" date NOT NULL,
        "estimated_hours" integer,
        "project_manager_id" uuid NOT NULL,
        "project_lead_id" uuid NOT NULL,
        "require_time_tracking" boolean NOT NULL DEFAULT false,
        "enable_notifications" boolean NOT NULL DEFAULT true,
        "enable_client_portal" boolean NOT NULL DEFAULT false,
        "is_archived" boolean NOT NULL DEFAULT false,
        "created_by" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_project_id" PRIMARY KEY ("project_id"),
        CONSTRAINT "UQ_project_code" UNIQUE ("project_code")
      )
    `);

    // 4️⃣ Foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "projects"
      ADD CONSTRAINT "FK_project_manager" FOREIGN KEY ("project_manager_id") REFERENCES "users"("id") ON DELETE RESTRICT
    `);
    await queryRunner.query(`
      ALTER TABLE "projects"
      ADD CONSTRAINT "FK_project_lead" FOREIGN KEY ("project_lead_id") REFERENCES "users"("id") ON DELETE RESTRICT
    `);
    await queryRunner.query(`
      ALTER TABLE "projects"
      ADD CONSTRAINT "FK_project_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1️⃣ Drop foreign keys
    await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "FK_project_created_by"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "FK_project_lead"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "FK_project_manager"`);

    // 2️⃣ Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS "projects"`);

    // 3️⃣ Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."projects_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."projects_project_type_enum"`);
  }
}
