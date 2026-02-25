import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProjectDocumentsTable1772001750972 implements MigrationInterface {
    name = 'CreateProjectDocumentsTable1772001750972'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create the table with constraints matching your Entity
        await queryRunner.query(`
            CREATE TABLE "project_documents" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "name" character varying(255) NOT NULL, 
                "url" text NOT NULL, 
                "size" integer NOT NULL, 
                "mime_type" character varying(100) NOT NULL, 
                "project_id" uuid NOT NULL, 
                "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_project_documents_id" PRIMARY KEY ("id")
            )
        `);

        // Add Foreign Key linking to projects table
        await queryRunner.query(`
            ALTER TABLE "project_documents" 
            ADD CONSTRAINT "FK_project_documents_project" 
            FOREIGN KEY ("project_id") REFERENCES "projects"("id") 
            ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop constraint first, then the table
        await queryRunner.query(`ALTER TABLE "project_documents" DROP CONSTRAINT "FK_project_documents_project"`);
        await queryRunner.query(`DROP TABLE "project_documents"`);
    }
}