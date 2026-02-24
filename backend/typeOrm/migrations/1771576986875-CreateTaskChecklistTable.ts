import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTaskChecklistTable1771576986875 implements MigrationInterface {
  name = 'CreateTaskChecklistTable1771576986875';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure UUID extension exists
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE "task_checklist" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "task_id" uuid NOT NULL,
        "item_name" varchar(255) NOT NULL,
        "is_completed" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),

        CONSTRAINT "PK_task_checklist" PRIMARY KEY ("id"),

        CONSTRAINT "FK_task_checklist_task"
          FOREIGN KEY ("task_id")
          REFERENCES "tasks"("id")
          ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "task_checklist"`);
  }
}