import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTaskChecklistTable1771576986875 implements MigrationInterface {
    name = 'CreateTaskChecklistTable1771576986875'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee_profiles" DROP CONSTRAINT "FK_employee_profiles_users"`);
        await queryRunner.query(`ALTER TABLE "employee_profiles" DROP CONSTRAINT "FK_employee_profiles_departments"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_project"`);
        await queryRunner.query(`ALTER TABLE "admin_profiles" DROP CONSTRAINT "FK_admin_profiles_users"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_roles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_departments_code"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_admin_profiles_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_email"`);
        await queryRunner.query(`CREATE TABLE "task_checklist" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "item_name" character varying NOT NULL, "is_completed" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "taskId" uuid NOT NULL, CONSTRAINT "PK_1ef03972b670959f1a944cc73ff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "employee_profiles" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "employee_profiles" ALTER COLUMN "department_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."projects_status_enum" RENAME TO "projects_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."projects_status_enum" AS ENUM('Draft', 'Active', 'Completed', 'Archived')`);
        await queryRunner.query(`ALTER TABLE "projects" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "projects" ALTER COLUMN "status" TYPE "public"."projects_status_enum" USING "status"::"text"::"public"."projects_status_enum"`);
        await queryRunner.query(`ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'Draft'`);
        await queryRunner.query(`DROP TYPE "public"."projects_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_users_email"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_91fddbe23e927e1e525c152baa" ON "departments" ("code") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`ALTER TABLE "employee_profiles" ADD CONSTRAINT "FK_986e309c16f09ce6cc47d674cfe" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_profiles" ADD CONSTRAINT "FK_460fcd97e0cdf808147c3d03721" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_9eecdb5b1ed8c7c2a1b392c28d4" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin_profiles" ADD CONSTRAINT "FK_a3d9676173d45095f26252902b1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_checklist" ADD CONSTRAINT "FK_d262841259512a65d02bb9510a6" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_checklist" DROP CONSTRAINT "FK_d262841259512a65d02bb9510a6"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`);
        await queryRunner.query(`ALTER TABLE "admin_profiles" DROP CONSTRAINT "FK_a3d9676173d45095f26252902b1"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_9eecdb5b1ed8c7c2a1b392c28d4"`);
        await queryRunner.query(`ALTER TABLE "employee_profiles" DROP CONSTRAINT "FK_460fcd97e0cdf808147c3d03721"`);
        await queryRunner.query(`ALTER TABLE "employee_profiles" DROP CONSTRAINT "FK_986e309c16f09ce6cc47d674cfe"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_91fddbe23e927e1e525c152baa"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_users_email" UNIQUE ("email")`);
        await queryRunner.query(`CREATE TYPE "public"."projects_status_enum_old" AS ENUM('Draft', 'Active', 'Completed')`);
        await queryRunner.query(`ALTER TABLE "projects" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "projects" ALTER COLUMN "status" TYPE "public"."projects_status_enum_old" USING "status"::"text"::"public"."projects_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'Draft'`);
        await queryRunner.query(`DROP TYPE "public"."projects_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."projects_status_enum_old" RENAME TO "projects_status_enum"`);
        await queryRunner.query(`ALTER TABLE "employee_profiles" ALTER COLUMN "department_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "employee_profiles" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`DROP TABLE "task_checklist"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_admin_profiles_user_id" ON "admin_profiles" ("user_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_departments_code" ON "departments" ("code") WHERE (code IS NOT NULL)`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_users_roles" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin_profiles" ADD CONSTRAINT "FK_admin_profiles_users" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_project_id" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_profiles" ADD CONSTRAINT "FK_employee_profiles_departments" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_profiles" ADD CONSTRAINT "FK_employee_profiles_users" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
