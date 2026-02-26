import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProjectTypesTable1770780000000 implements MigrationInterface {
    name = 'CreateProjectTypesTable1770780000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "project_types" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(100) NOT NULL,
                "description" text,
                "department_id" uuid NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_project_type_name" UNIQUE ("name"),
                CONSTRAINT "PK_project_types" PRIMARY KEY ("id"),
                CONSTRAINT "FK_project_types_department" 
                    FOREIGN KEY ("department_id") 
                    REFERENCES "departments"("id") ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "project_types"`);
    }
}