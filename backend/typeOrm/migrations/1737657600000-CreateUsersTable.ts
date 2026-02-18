import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1737657600000 implements MigrationInterface {
  name = 'CreateUsersTable1737657600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Setup Extensions
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // 2. CREATE ROLES TABLE FIRST (Crucial Step)
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(50) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_roles" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_roles_name" UNIQUE ("name")
      )
    `);

    // 3. SEED ROLES (So user creation doesn't fail later)
    await queryRunner.query(`
      INSERT INTO "roles" ("name") VALUES ('admin'), ('employee')
    `);

    // 4. CREATE USERS TABLE
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying(255) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "role_id" uuid NOT NULL,
        "is_verified" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "FK_users_roles" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}