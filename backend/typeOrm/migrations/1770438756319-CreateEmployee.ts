import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmployeeProfiles1770438756319 implements MigrationInterface {
  name = 'CreateEmployeeProfiles1770438756319';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure UUID extension exists
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create enums
    await queryRunner.query(`
      CREATE TYPE "public"."employee_profiles_employment_type_enum"
      AS ENUM ('FULL_TIME', 'INTERN', 'CONTRACT')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."employee_profiles_employment_status_enum"
      AS ENUM ('ACTIVE', 'INACTIVE', 'ON_NOTICE', 'EXITED')
    `);

    // Create table
    await queryRunner.query(`
      CREATE TABLE "employee_profiles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "department_id" uuid,
        "name" varchar(255) NOT NULL,
        "phone" varchar(20),
        "alternate_phone" varchar(20),
        "designation" varchar(100) NOT NULL,
        "employment_type" "public"."employee_profiles_employment_type_enum" NOT NULL DEFAULT 'FULL_TIME',
        "employment_status" "public"."employee_profiles_employment_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "date_of_joining" date NOT NULL,
        "date_of_exit" date,
        "location" varchar(100) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),

        CONSTRAINT "PK_employee_profiles" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_employee_profiles_user_id" UNIQUE ("user_id"),

        CONSTRAINT "FK_employee_profiles_users"
          FOREIGN KEY ("user_id")
          REFERENCES "users"("id")
          ON DELETE CASCADE,

        CONSTRAINT "FK_employee_profiles_departments"
          FOREIGN KEY ("department_id")
          REFERENCES "departments"("id")
          ON DELETE SET NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "employee_profiles"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."employee_profiles_employment_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."employee_profiles_employment_type_enum"`);
  }
}