import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTaskChecklistTable1771576986875 implements MigrationInterface {
    name = 'CreateTaskChecklistTable1771576986875'

    public async up(queryRunner: QueryRunner): Promise<void> {

        // Drop old constraints
        await queryRunner.query(`ALTER TABLE "employee_profiles" DROP CONSTRAINT "FK_employee_profiles_users"`);
        await queryRunner.query(`ALTER TABLE "employee_profiles" DROP CONSTRAINT "FK_employee_profiles_departments"`);
        await queryRunner.query(`ALTER TABLE "tasks"DROP CONSTRAINT IF EXISTS "FK_tasks_project"`);
        await queryRunner.query(`ALTER TABLE "admin_profiles" DROP CONSTRAINT "FK_admin_profiles_users"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_roles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_departments_code"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_admin_profiles_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_email"`);

        // Create task_checklist table
        await queryRunner.query(`
            CREATE TABLE "task_checklist" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "item_name" character varying NOT NULL,
                "is_completed" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "task_id" uuid NOT NULL,
                CONSTRAINT "PK_task_checklist_id" PRIMARY KEY ("id")
            )
        `);

        // Add the foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "task_checklist"
            ADD CONSTRAINT "FK_task_checklist_task"
            FOREIGN KEY ("task_id") REFERENCES "tasks"("id")
            ON DELETE CASCADE
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the foreign key first
        await queryRunner.query(`
            ALTER TABLE "task_checklist"
            DROP CONSTRAINT IF EXISTS "FK_task_checklist_task"
        `);

        // Then drop the table
        await queryRunner.query(`DROP TABLE IF EXISTS "task_checklist"`);
    }
}