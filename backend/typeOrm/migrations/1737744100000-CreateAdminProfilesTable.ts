import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreateAdminProfilesTable
 *
 * Creates admin_profiles table with user_id (FK -> users.id, unique),
 * name, bio, is_active, created_at, updated_at.
 */
export class CreateAdminProfilesTable1737744100000 implements MigrationInterface {
  name = 'CreateAdminProfilesTable1737744100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    `);

    await queryRunner.query(`
      CREATE TABLE "admin_profiles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "bio" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_admin_profiles" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_admin_profiles_user_id" UNIQUE ("user_id"),
        CONSTRAINT "FK_admin_profiles_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_admin_profiles_user_id" ON "admin_profiles" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_admin_profiles_user_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "admin_profiles"`);
  }
}
