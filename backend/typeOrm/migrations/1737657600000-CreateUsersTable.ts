import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1737657600000 implements MigrationInterface {
  name = 'CreateUsersTable1737657600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // ROLES TABLE
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(50) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_roles" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_roles_name" UNIQUE ("name")
      )
    `);

    // Safe seed
    await queryRunner.query(`
      INSERT INTO "roles" ("name")
      VALUES ('admin'), ('employee')
      ON CONFLICT ("name") DO NOTHING
    `);

    // USERS TABLE (NO unique constraint on email)
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" varchar(255) NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        "role_id" uuid NOT NULL,
        "is_verified" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "FK_users_roles"
          FOREIGN KEY ("role_id")
          REFERENCES "roles"("id")
          ON DELETE RESTRICT
      )
    `);

    // Unique index from @Index decorator
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_users_email"
      ON "users" ("email")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "roles"`);
  }
}