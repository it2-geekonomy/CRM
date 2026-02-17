import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProjectModule1770792048680 implements MigrationInterface {
    name = 'CreateProjectModule1770792048680'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enums without 'Archived' status
        await queryRunner.query(`CREATE TYPE "public"."projects_project_type_enum" AS ENUM('Website', 'App', 'CRM', 'Internal')`);
        await queryRunner.query(`CREATE TYPE "public"."projects_status_enum" AS ENUM('Draft', 'Active', 'Completed')`);
        
        // Table without is_archived or deleted_at
        await queryRunner.query(`CREATE TABLE "projects" (
            "project_id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
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
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "UQ_11b19c7d40d07fc1a4e167995e1" UNIQUE ("project_code"), 
            CONSTRAINT "PK_b3613537a59b41f5811258edf99" PRIMARY KEY ("project_id")
        )`);

        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_aaf9d96cf264ced3a4828873132" FOREIGN KEY ("project_manager_id") REFERENCES "admin_profiles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_b1bc2a5f9df8b23eed42db3911c" FOREIGN KEY ("project_lead_id") REFERENCES "employee_profiles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_8a7ccdb94bcc8635f933c8f8080" FOREIGN KEY ("created_by") REFERENCES "admin_profiles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_8a7ccdb94bcc8635f933c8f8080"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_b1bc2a5f9df8b23eed42db3911c"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_aaf9d96cf264ced3a4828873132"`);
        await queryRunner.query(`DROP TABLE "projects"`);
        await queryRunner.query(`DROP TYPE "public"."projects_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."projects_project_type_enum"`);
    }
}