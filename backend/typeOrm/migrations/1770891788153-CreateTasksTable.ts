import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTasksTable1770891788153 implements MigrationInterface {
    name = 'CreateTasksTable1770891788153'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."task_status_enum" AS ENUM('IN_PROGRESS', 'ON_HOLD', 'REVIEW', 'ADDRESSED', 'OVERDUE')`);
        await queryRunner.query(`CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "task_name" character varying(255) NOT NULL, "task_description" text, "start_date" date NOT NULL, "start_time" TIME NOT NULL, "end_date" date NOT NULL, "end_time" TIME NOT NULL, "task_status" "public"."task_status_enum" NOT NULL DEFAULT 'IN_PROGRESS', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "assigned_to_id" uuid NOT NULL, "assigned_by_id" uuid NOT NULL, CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_9430f12c5a1604833f64595a57f" FOREIGN KEY ("assigned_to_id") REFERENCES "employee_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_3e08a7ca125a175cf899b09f71a" FOREIGN KEY ("assigned_by_id") REFERENCES "employee_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_3e08a7ca125a175cf899b09f71a"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_9430f12c5a1604833f64595a57f"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP TYPE "public"."task_status_enum"`);
    }

}
