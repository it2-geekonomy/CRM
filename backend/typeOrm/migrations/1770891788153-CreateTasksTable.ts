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

        await queryRunner.query(`
            CREATE TABLE "tasks" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "description" text,
                "startDate" date NOT NULL,
                "startTime" TIME NOT NULL,
                "endDate" date NOT NULL,
                "endTime" TIME NOT NULL,
                "status" "public"."task_status_enum" NOT NULL DEFAULT 'IN_PROGRESS',
                "priority" "public"."task_priority_enum" NOT NULL DEFAULT 'Medium',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "assigned_to_id" uuid NOT NULL,
                "assigned_by_id" uuid NOT NULL,
                "project_id" uuid NOT NULL,
                "task_type_id" uuid NOT NULL,
                CONSTRAINT "PK_tasks_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "tasks"
            ADD CONSTRAINT "FK_tasks_assigned_to"
            FOREIGN KEY ("assigned_to_id")
            REFERENCES "employee_profiles"("id")
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "tasks"
            ADD CONSTRAINT "FK_tasks_assigned_by"
            FOREIGN KEY ("assigned_by_id")
            REFERENCES "employee_profiles"("id")
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "tasks"
            ADD CONSTRAINT "FK_tasks_project"
            FOREIGN KEY ("project_id")
            REFERENCES "projects"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
`);

        await queryRunner.query(`
            ALTER TABLE "tasks"
            ADD CONSTRAINT "FK_tasks_task_type"
            FOREIGN KEY ("task_type_id")
            REFERENCES "task_types"("id")
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_task_type"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_project"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_assigned_by"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_assigned_to"`);

        await queryRunner.query(`DROP TABLE "tasks"`);

        await queryRunner.query(`DROP TYPE IF EXISTS "public"."task_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."task_priority_enum"`);
    }
}