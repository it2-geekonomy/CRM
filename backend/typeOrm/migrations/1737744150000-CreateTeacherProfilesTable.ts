import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreateTeacherProfilesTable
 *
 * Creates teacher_profiles: user_id (FK -> users.id, unique), name, bio,
 * phone, profile_pic_url, age, is_approved, created_at, updated_at.
 */
export class CreateTeacherProfilesTable1737744150000 implements MigrationInterface {
  name = 'CreateTeacherProfilesTable1737744150000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    `);

    await queryRunner.query(`
      CREATE TABLE "teacher_profiles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "bio" text,
        "phone" character varying(30),
        "profile_pic_url" character varying(500),
        "age" integer,
        "is_approved" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_teacher_profiles" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_teacher_profiles_user_id" UNIQUE ("user_id"),
        CONSTRAINT "FK_teacher_profiles_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_teacher_profiles_user_id" ON "teacher_profiles" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_teacher_profiles_user_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "teacher_profiles"`);
  }
}
