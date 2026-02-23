import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTaskFilesTable1771584114592 implements MigrationInterface {
    name = 'CreateTaskFilesTable1771584114592'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "task_files" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "url" character varying(500) NOT NULL,
                "type" character varying(50),
                "uploaded_at" TIMESTAMP NOT NULL DEFAULT now(),
                "task_id" uuid NOT NULL,
                "uploaded_by_id" uuid NOT NULL,
                CONSTRAINT "PK_ef0155509609893f1c0cb9811a8" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "task_files"
            ADD CONSTRAINT "FK_task_files_task"
            FOREIGN KEY ("task_id")
            REFERENCES "tasks"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "task_files"
            ADD CONSTRAINT "FK_task_files_uploaded_by"
            FOREIGN KEY ("uploaded_by_id")
            REFERENCES "employee_profiles"("id")
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_files" DROP CONSTRAINT "FK_task_files_uploaded_by"`);
        await queryRunner.query(`ALTER TABLE "task_files" DROP CONSTRAINT "FK_task_files_task"`);
        await queryRunner.query(`DROP TABLE "task_files"`);
    }
}