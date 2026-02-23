import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTaskActivityTable1770959264546 implements MigrationInterface {
    name = 'CreateTaskActivityTable1770959264546'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."task_activity_old_status_enum" 
            AS ENUM('IN_PROGRESS', 'ON_HOLD', 'REVIEW', 'ADDRESSED', 'OVERDUE')
        `);

        await queryRunner.query(`
            CREATE TYPE "public"."task_activity_new_status_enum" 
            AS ENUM('IN_PROGRESS', 'ON_HOLD', 'REVIEW', 'ADDRESSED', 'OVERDUE')
        `);

        await queryRunner.query(`
            CREATE TABLE "task_activity" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "old_status" "public"."task_activity_old_status_enum" NOT NULL,
                "new_status" "public"."task_activity_new_status_enum" NOT NULL,
                "change_reason" character varying,
                "changed_at" TIMESTAMP NOT NULL DEFAULT now(),
                "task_id" uuid NOT NULL,
                "changed_by_id" uuid NOT NULL,
                CONSTRAINT "PK_a8f24c7952c9ff5533f88279941" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "task_activity"
            ADD CONSTRAINT "FK_task_activity_task"
            FOREIGN KEY ("task_id")
            REFERENCES "tasks"("id")
            ON DELETE CASCADE
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "task_activity"
            ADD CONSTRAINT "FK_task_activity_changed_by"
            FOREIGN KEY ("changed_by_id")
            REFERENCES "employee_profiles"("id")
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "task_activity" 
            DROP CONSTRAINT "FK_task_activity_changed_by"
        `);

        await queryRunner.query(`
            ALTER TABLE "task_activity" 
            DROP CONSTRAINT "FK_task_activity_task"
        `);

        await queryRunner.query(`DROP TABLE "task_activity"`);

        await queryRunner.query(`DROP TYPE "public"."task_activity_new_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."task_activity_old_status_enum"`);
    }
}