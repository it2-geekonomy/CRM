import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmployee1770438756319 implements MigrationInterface {
    name = 'CreateEmployee1770438756319'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_role_id"`);
        await queryRunner.query(`ALTER TABLE "admin_profiles" DROP CONSTRAINT "FK_admin_profiles_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_admin_profiles_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_departments_code"`);
        await queryRunner.query(`CREATE TYPE "public"."employee_profiles_employmenttype_enum" AS ENUM('FULL_TIME', 'INTERN', 'CONTRACT')`);
        await queryRunner.query(`CREATE TYPE "public"."employee_profiles_employmentstatus_enum" AS ENUM('ACTIVE', 'INACTIVE', 'ON_NOTICE', 'EXITED')`);
        await queryRunner.query(`CREATE TABLE "employee_profiles" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "phone" character varying(20), "alternatePhone" character varying(20), "designation" character varying(100) NOT NULL, "employmentType" "public"."employee_profiles_employmenttype_enum" NOT NULL DEFAULT 'FULL_TIME', "employmentStatus" "public"."employee_profiles_employmentstatus_enum" NOT NULL DEFAULT 'ACTIVE', "dateOfJoining" date NOT NULL, "dateOfExit" date, "location" character varying(100) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "departmentId" uuid NOT NULL, CONSTRAINT "REL_b52deb77aad7a520ed76f25b90" UNIQUE ("userId"), CONSTRAINT "PK_8481c6a4516f6589b23adf7fefa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_91fddbe23e927e1e525c152baa" ON "departments" ("code") `);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin_profiles" ADD CONSTRAINT "FK_a3d9676173d45095f26252902b1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_profiles" ADD CONSTRAINT "FK_b52deb77aad7a520ed76f25b902" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_profiles" ADD CONSTRAINT "FK_a45bbde381b2a26fd9100eb56ef" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee_profiles" DROP CONSTRAINT "FK_a45bbde381b2a26fd9100eb56ef"`);
        await queryRunner.query(`ALTER TABLE "employee_profiles" DROP CONSTRAINT "FK_b52deb77aad7a520ed76f25b902"`);
        await queryRunner.query(`ALTER TABLE "admin_profiles" DROP CONSTRAINT "FK_a3d9676173d45095f26252902b1"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_91fddbe23e927e1e525c152baa"`);
        await queryRunner.query(`DROP TABLE "employee_profiles"`);
        await queryRunner.query(`DROP TYPE "public"."employee_profiles_employmentstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."employee_profiles_employmenttype_enum"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_departments_code" ON "departments" ("code") WHERE (code IS NOT NULL)`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_admin_profiles_user_id" ON "admin_profiles" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "admin_profiles" ADD CONSTRAINT "FK_admin_profiles_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_users_role_id" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}
