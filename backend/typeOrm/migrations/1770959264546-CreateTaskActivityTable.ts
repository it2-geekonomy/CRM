import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTaskActivityTable1770959264546 implements MigrationInterface {
    name = 'CreateTaskActivityTable1770959264546'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."task_activity_old_status_enum" AS ENUM('IN_PROGRESS', 'ON_HOLD', 'REVIEW', 'ADDRESSED', 'OVERDUE')`);
        await queryRunner.query(`CREATE TYPE "public"."task_activity_new_status_enum" AS ENUM('IN_PROGRESS', 'ON_HOLD', 'REVIEW', 'ADDRESSED', 'OVERDUE')`);
        await queryRunner.query(`CREATE TABLE "task_activity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "old_status" "public"."task_activity_old_status_enum" NOT NULL, "new_status" "public"."task_activity_new_status_enum" NOT NULL, "change_reason" character varying, "changed_at" TIMESTAMP NOT NULL DEFAULT now(), "taskId" uuid NOT NULL, "changedById" uuid NOT NULL, CONSTRAINT "PK_a8f24c7952c9ff5533f88279941" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "task_activity" ADD CONSTRAINT "FK_dd4d1f026f618e434d9254c0d68" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_activity" ADD CONSTRAINT "FK_c83041eec4ff84effa76c7073c1" FOREIGN KEY ("changedById") REFERENCES "employee_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_activity" DROP CONSTRAINT "FK_c83041eec4ff84effa76c7073c1"`);
        await queryRunner.query(`ALTER TABLE "task_activity" DROP CONSTRAINT "FK_dd4d1f026f618e434d9254c0d68"`);
        await queryRunner.query(`DROP TABLE "task_activity"`);
        await queryRunner.query(`DROP TYPE "public"."task_activity_new_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."task_activity_old_status_enum"`);
    }

}
