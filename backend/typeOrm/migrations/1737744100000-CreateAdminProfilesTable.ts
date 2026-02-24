import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdminProfilesTable1737744100000 implements MigrationInterface {
  name = 'CreateAdminProfilesTable1737744100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "admin_profiles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "name" varchar(255) NOT NULL,
        "bio" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_admin_profiles" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_admin_profiles_user_id" UNIQUE ("user_id"),
        CONSTRAINT "FK_admin_profiles_users"
          FOREIGN KEY ("user_id")
          REFERENCES "users"("id")
          ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "admin_profiles"`);
  }
}