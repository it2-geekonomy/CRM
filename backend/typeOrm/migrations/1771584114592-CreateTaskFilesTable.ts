import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTaskFilesTable1771584114592 implements MigrationInterface {
    name = 'CreateTaskFilesTable1771584114592'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "task_files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "file_name" character varying NOT NULL, "file_url" character varying NOT NULL, "file_type" character varying, "uploaded_at" TIMESTAMP NOT NULL DEFAULT now(), "taskId" uuid NOT NULL, "uploadedById" uuid NOT NULL, CONSTRAINT "PK_ef0155509609893f1c0cb9811a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "task_files" ADD CONSTRAINT "FK_a2652bf7bcf7d691eb5da322729" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_files" ADD CONSTRAINT "FK_b24bb2792f993a71056a9e8f942" FOREIGN KEY ("uploadedById") REFERENCES "employee_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_files" DROP CONSTRAINT "FK_b24bb2792f993a71056a9e8f942"`);
        await queryRunner.query(`ALTER TABLE "task_files" DROP CONSTRAINT "FK_a2652bf7bcf7d691eb5da322729"`);
        await queryRunner.query(`DROP TABLE "task_files"`);
    }

}
