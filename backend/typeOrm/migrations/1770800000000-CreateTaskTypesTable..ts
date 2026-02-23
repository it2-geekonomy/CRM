import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTaskTypesTable1770800000000 implements MigrationInterface {
    name = 'CreateTaskTypesTable1770800000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum for status
        await queryRunner.query(`
            CREATE TYPE "task_type_status_enum" AS ENUM('Active', 'Inactive')
        `);

        // Create task_types table
        await queryRunner.query(`
            CREATE TABLE "task_types" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "description" text,
                "billable" boolean NOT NULL DEFAULT true,
                "sla_hours" integer,
                "status" "task_type_status_enum" NOT NULL DEFAULT 'Active',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "department_id" uuid NOT NULL,
                CONSTRAINT "PK_task_types_id" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key for department
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
        // Drop foreign key
        await queryRunner.query(`
            ALTER TABLE "task_types"
            DROP CONSTRAINT "FK_task_types_department"
        `);

        // Drop table
        await queryRunner.query(`DROP TABLE "task_types"`);

        // Drop enum type
        await queryRunner.query(`DROP TYPE "task_type_status_enum"`);
    }
}