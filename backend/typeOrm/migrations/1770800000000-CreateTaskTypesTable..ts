import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTaskTypesTable1770800000000 implements MigrationInterface {
    name = 'CreateTaskTypesTable1770800000000'

    public async up(queryRunner: QueryRunner): Promise<void> {

        // Create task_types table
        await queryRunner.query(`
            CREATE TABLE "task_types" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "description" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "department_id" uuid NOT NULL,
                CONSTRAINT "PK_task_types_id" PRIMARY KEY ("id")
            )
        `);

        // FK: task_types -> departments
        await queryRunner.query(`
            ALTER TABLE "task_types"
            ADD CONSTRAINT "FK_task_types_department"
            FOREIGN KEY ("department_id")
            REFERENCES "departments"("id")
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            ALTER TABLE "task_types"
            DROP CONSTRAINT "FK_task_types_department"
        `);

        await queryRunner.query(`DROP TABLE "task_types"`);
    }
}