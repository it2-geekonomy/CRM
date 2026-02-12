import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmployee1770438756319 implements MigrationInterface {
    name = 'CreateEmployee1770438756319'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // --- STEP 1: COMMENT THESE OUT TO PREVENT CRASHING ---
        // These constraints likely don't exist anymore because of your manual changes
        // await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_role_id"`);
        // await queryRunner.query(`ALTER TABLE "admin_profiles" DROP CONSTRAINT "FK_admin_profiles_user_id"`);
        // await queryRunner.query(`DROP INDEX "public"."IDX_admin_profilwes_user_id"`);
        // await queryRunner.query(`DROP INDEX "public"."IDX_departments_code"`);

        // --- STEP 2: CREATE TYPES ---
        await queryRunner.query(`CREATE TYPE "public"."employee_profiles_employmenttype_enum" AS ENUM('FULL_TIME', 'INTERN', 'CONTRACT')`);
        await queryRunner.query(`CREATE TYPE "public"."employee_profiles_employmentstatus_enum" AS ENUM('ACTIVE', 'INACTIVE', 'ON_NOTICE', 'EXITED')`);

        // --- STEP 3: CREATE TABLE (ID CHANGED FROM SERIAL TO UUID) ---
        await queryRunner.query(`CREATE TABLE "employee_profiles" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "name" character varying(255) NOT NULL, 
            "phone" character varying(20), 
            "alternatePhone" character varying(20), 
            "designation" character varying(100) NOT NULL, 
            "employmentType" "public"."employee_profiles_employmenttype_enum" NOT NULL DEFAULT 'FULL_TIME', 
            "employmentStatus" "public"."employee_profiles_employmentstatus_enum" NOT NULL DEFAULT 'ACTIVE', 
            "dateOfJoining" date NOT NULL, 
            "dateOfExit" date, 
            "location" character varying(100) NOT NULL, 
            "isActive" boolean NOT NULL DEFAULT true, 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "userId" uuid, 
            "departmentId" uuid NOT NULL, 
            CONSTRAINT "REL_b52deb77aad7a520ed76f25b90" UNIQUE ("userId"), 
            CONSTRAINT "PK_8481c6a4516f6589b23adf7fefa" PRIMARY KEY ("id")
        )`);

        // --- STEP 4: INDEXES & RELATIONS ---
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_91fddbe23e927e1e525c152baa" ON "departments" ("code") `);
        await queryRunner.query(`ALTER TABLE "employee_profiles" ADD CONSTRAINT "FK_b52deb77aad7a520ed76f25b902" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_profiles" ADD CONSTRAINT "FK_a45bbde381b2a26fd9100eb56ef" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee_profiles" DROP CONSTRAINT "FK_a45bbde381b2a26fd9100eb56ef"`);
        await queryRunner.query(`ALTER TABLE "employee_profiles" DROP CONSTRAINT "FK_b52deb77aad7a520ed76f25b902"`);
        await queryRunner.query(`DROP TABLE "employee_profiles"`);
        await queryRunner.query(`DROP TYPE "public"."employee_profiles_employmentstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."employee_profiles_employmenttype_enum"`);
    }
}