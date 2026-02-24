import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTasksTable1770891788153 implements MigrationInterface {
    name = 'CreateTasksTable1770891788153'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enums if they don't exist
        const statusTypeExists = await queryRunner.query(
            `SELECT 1 FROM pg_type WHERE typname = 'task_status_enum'`
        );
        if (statusTypeExists.length === 0) {
            await queryRunner.query(
                `CREATE TYPE "public"."task_status_enum" AS ENUM('IN_PROGRESS', 'ON_HOLD', 'REVIEW', 'ADDRESSED', 'OVERDUE')`
            );
        }

        // Safe check for task_priority_enum

        const priorityTypeExists = await queryRunner.query(
            `SELECT 1 FROM pg_type WHERE typname = 'task_priority_enum'`
        );
        if (priorityTypeExists.length === 0) {
            await queryRunner.query(
                `CREATE TYPE "public"."task_priority_enum" AS ENUM('Low', 'Medium', 'High')`
            );
        }

        // Create tasks table (UPDATED with task_type_id)
        await queryRunner.query(`
            CREATE TABLE "tasks" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "task_name" character varying(255) NOT NULL,
                "task_description" text,
                "start_date" date NOT NULL,
                "start_time" TIME NOT NULL,
                "end_date" date NOT NULL,
                "end_time" TIME NOT NULL,
                "task_status" "public"."task_status_enum" NOT NULL DEFAULT 'IN_PROGRESS',
                "priority" "public"."task_priority_enum" NOT NULL DEFAULT 'Medium',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "assigned_to_id" uuid NOT NULL,
                "assigned_by_id" uuid NOT NULL,
                "project_id" uuid NOT NULL,
                "task_type_id" uuid NOT NULL,
                CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id")
            )
        `);

        // Add foreign keys
        await queryRunner.query(`
            ALTER TABLE "tasks"
            ADD CONSTRAINT "FK_9430f12c5a1604833f64595a57f"
            FOREIGN KEY ("assigned_to_id")
            REFERENCES "employee_profiles"("id")
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "tasks"
            ADD CONSTRAINT "FK_3e08a7ca125a175cf899b09f71a"
            FOREIGN KEY ("assigned_by_id")
            REFERENCES "employee_profiles"("id")
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "tasks"
            ADD CONSTRAINT "FK_project_id"
            FOREIGN KEY ("project_id")
            REFERENCES "projects"("project_id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        // 🔥 NEW FK for task_type
        await queryRunner.query(`
            ALTER TABLE "tasks"
            ADD CONSTRAINT "FK_tasks_task_type"
            FOREIGN KEY ("task_type_id")
            REFERENCES "task_types"("id")
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys first
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_task_type"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_project_id"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_3e08a7ca125a175cf899b09f71a"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_9430f12c5a1604833f64595a57f"`);

        // Drop table
        await queryRunner.query(`DROP TABLE "tasks"`);

        // Drop enums
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."task_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."task_priority_enum"`);
    }
}