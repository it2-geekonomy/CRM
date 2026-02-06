import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreateUsersTable
 * 
 * This migration creates the users table with all required columns,
 * enum type, and indexes based on the User entity.
 * 
 * Generated from: src/modules/users/entities/user.entity.ts
 */
export class CreateUsersTable1737657600000 implements MigrationInterface {
  name = 'CreateUsersTable1737657600000';

  /**
   * UP Migration: Creates the users table
   * Executes when running: pnpm migration:run
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Create enum type for user roles
    await queryRunner.query(`
      CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'teacher', 'student')
    `);

    // Step 2: Create UUID extension if not exists (for uuid_generate_v4())
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    `);

    // Step 3: Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying(255) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'student',
        "is_verified" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);

    // Step 4: Create unique constraint on email
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")
    `);

    // Step 5: Create unique index on email (as specified in entity)
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" 
      ON "users" ("email")
    `);
  }

  /**
   * DOWN Migration: Rolls back the users table
   * Executes when running: pnpm migration:revert
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Drop the unique index on email
    await queryRunner.query(`
      DROP INDEX IF EXISTS "public"."IDX_97672ac88f789774dd47f7c8be"
    `);

    // Step 2: Drop the unique constraint on email
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP CONSTRAINT IF EXISTS "UQ_97672ac88f789774dd47f7c8be3"
    `);

    // Step 3: Drop the users table
    await queryRunner.query(`
      DROP TABLE IF EXISTS "users"
    `);

    // Step 4: Drop the enum type
    await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."users_role_enum"
    `);
  }
}
