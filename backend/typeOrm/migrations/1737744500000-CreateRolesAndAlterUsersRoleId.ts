import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreateRolesAndAlterUsersRoleId (merged)
 *
 * up:   1) Create `roles`  2) Seed admin, teacher, student  3) users.role -> role_id (FK)
 * down: 1) Restore users.role (enum)  2) Drop role_id  3) Drop `roles`
 */

export class CreateRolesAndAlterUsersRoleId1737744500000
  implements MigrationInterface
{
  name = 'CreateRolesAndAlterUsersRoleId1737744500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- 1. Roles table ---
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(50) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_roles" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_roles_name" UNIQUE ("name")
      )
    `);

    // --- 2. Seed roles (CRM: admin + employee only) ---
    await queryRunner.query(`
      INSERT INTO "roles" ("id", "name", "created_at", "updated_at")
      VALUES
        (uuid_generate_v4(), 'admin', now(), now()),
        (uuid_generate_v4(), 'employee', now(), now())
      ON CONFLICT ("name") DO NOTHING
    `);

    // --- 3. Alter users: add role_id, backfill, drop role enum (only if role_id not already there) ---
    const hasRoleId = await queryRunner.query(`
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role_id'
      LIMIT 1
    `);
    if (hasRoleId.length === 0) {
      await queryRunner.query(`
        ALTER TABLE "users" ADD COLUMN "role_id" uuid NULL
      `);
      await queryRunner.query(`
        ALTER TABLE "users"
        ADD CONSTRAINT "FK_users_role_id"
        FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      `);
      await queryRunner.query(`
        UPDATE "users" u
        SET "role_id" = (SELECT r."id" FROM "roles" r WHERE r."name" = u."role"::text)
      `);
      await queryRunner.query(`
        ALTER TABLE "users" ALTER COLUMN "role_id" SET NOT NULL
      `);
      await queryRunner.query(`
        ALTER TABLE "users" DROP COLUMN "role"
      `);
      await queryRunner.query(`
        DROP TYPE IF EXISTS "public"."users_role_enum"
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // --- 1. Recreate users.role enum and column, backfill from role_id ---
    await queryRunner.query(`
      CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'employee')
    `);
    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN "role" "public"."users_role_enum" NULL
    `);
    await queryRunner.query(`
      UPDATE "users" u
      SET "role" = (SELECT r."name"::"public"."users_role_enum" FROM "roles" r WHERE r."id" = u."role_id")
    `);
    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'employee'
    `);

    // --- 2. Drop role_id and FK ---
    await queryRunner.query(`
      ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_role_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN IF EXISTS "role_id"
    `);

    // --- 3. Drop roles table ---
    await queryRunner.query(`
      DROP TABLE IF EXISTS "roles"
    `);
  }
}
