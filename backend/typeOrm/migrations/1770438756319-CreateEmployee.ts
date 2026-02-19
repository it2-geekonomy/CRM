import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmployee1770438756319 implements MigrationInterface {
    name = 'CreateEmployee1770438756319'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
      CREATE TYPE "public"."employee_profiles_employment_type_enum"
      AS ENUM('FULL_TIME', 'INTERN', 'CONTRACT')
    `);

        await queryRunner.query(`
      CREATE TYPE "public"."employee_profiles_employment_status_enum"
      AS ENUM('ACTIVE', 'INACTIVE', 'ON_NOTICE', 'EXITED')
    `);

        await queryRunner.query(`
      CREATE TABLE "employee_profiles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "department_id" uuid, -- ✅ CHANGED (removed NOT NULL)
        "name" character varying(255) NOT NULL,
        "phone" character varying(20),
        "alternate_phone" character varying(20),
        "designation" character varying(100) NOT NULL,
        "employment_type" "public"."employee_profiles_employment_type_enum" NOT NULL DEFAULT 'FULL_TIME',
        "employment_status" "public"."employee_profiles_employment_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "date_of_joining" date NOT NULL,
        "date_of_exit" date,
        "location" character varying(100) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_employee_profiles" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_employee_profiles_user_id" UNIQUE ("user_id")
      )
    `);

        await queryRunner.query(`
      ALTER TABLE "employee_profiles"
      ADD CONSTRAINT "FK_employee_profiles_users"
      FOREIGN KEY ("user_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE
    `);

        await queryRunner.query(`
      ALTER TABLE "employee_profiles"
      ADD CONSTRAINT "FK_employee_profiles_departments"
      FOREIGN KEY ("department_id")
      REFERENCES "departments"("id")
      ON DELETE SET NULL -- ✅ CHANGED
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee_profiles" DROP CONSTRAINT "FK_employee_profiles_departments"`);
        await queryRunner.query(`ALTER TABLE "employee_profiles" DROP CONSTRAINT "FK_employee_profiles_users"`);
        await queryRunner.query(`DROP TABLE "employee_profiles"`);
        await queryRunner.query(`DROP TYPE "public"."employee_profiles_employment_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."employee_profiles_employment_type_enum"`);
    }
}
