import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProjectsTable1770792048680 implements MigrationInterface {
    name = 'CreateProjectsTable1770792048680'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enums
        await queryRunner.query(`CREATE TYPE "public"."projects_project_type_enum" AS ENUM('Website', 'App', 'CRM', 'Internal')`);
        await queryRunner.query(`CREATE TYPE "public"."projects_status_enum" AS ENUM('Draft', 'Active', 'Completed')`);

        // Projects table
        await queryRunner.query(`
        CREATE TABLE "projects" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "project_name" character varying(150) NOT NULL, 
            "project_code" character varying(50) NOT NULL, 
            "project_type" "public"."projects_project_type_enum" NOT NULL, 
            "project_description" text, 
            "status" "public"."projects_status_enum" NOT NULL DEFAULT 'Draft', 
            "start_date" date NOT NULL, 
            "end_date" date NOT NULL, 
            "estimated_hours" integer, 
            "project_manager_id" uuid NOT NULL, 
            "project_lead_id" uuid NOT NULL, 
            "require_time_tracking" boolean NOT NULL DEFAULT false, 
            "enable_notifications" boolean NOT NULL DEFAULT true, 
            "enable_client_portal" boolean NOT NULL DEFAULT false, 
            "created_by" uuid NOT NULL, 
            "client_id" uuid, 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "UQ_project_code" UNIQUE ("project_code"), 
            CONSTRAINT "PK_projects_id" PRIMARY KEY ("id")
        )
        `);

        // Project documents
        await queryRunner.query(`
        CREATE TABLE "project_documents" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "fileName" character varying NOT NULL,
            "fileUrl" character varying NOT NULL,
            "fileSize" integer NOT NULL,
            "mimeType" character varying NOT NULL,
            "projectId" uuid NOT NULL,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_project_documents_id" PRIMARY KEY ("id")
        )
        `);

        // Foreign keys
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_project_manager" FOREIGN KEY ("project_manager_id") REFERENCES "admin_profiles"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_project_lead" FOREIGN KEY ("project_lead_id") REFERENCES "employee_profiles"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_project_creator" FOREIGN KEY ("created_by") REFERENCES "admin_profiles"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_project_client" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL`);
        await queryRunner.query(`ALTER TABLE "project_documents" ADD CONSTRAINT "FK_project_documents_project" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project_documents" DROP CONSTRAINT "FK_project_documents_project"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_project_client"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_project_creator"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_project_lead"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_project_manager"`);
        await queryRunner.query(`DROP TABLE "project_documents"`);
        await queryRunner.query(`DROP TABLE "projects"`);
        await queryRunner.query(`DROP TYPE "public"."projects_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."projects_project_type_enum"`);
    }
}