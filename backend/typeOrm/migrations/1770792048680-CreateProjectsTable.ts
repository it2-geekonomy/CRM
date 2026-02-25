import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProjectsTable1770792048680 implements MigrationInterface {
    name = 'CreateProjectsTable1770792048680'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."projects_status_enum" AS ENUM('Draft', 'Active', 'Completed')
        `);

        // 2. Create the Projects Table
        await queryRunner.query(`
            CREATE TABLE "projects" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "name" character varying(150) NOT NULL, 
                "code" character varying(50) NOT NULL, 
                "project_type_id" uuid NOT NULL, 
                "description" text, 
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
                CONSTRAINT "UQ_project_code" UNIQUE ("code"), 
                CONSTRAINT "PK_projects_id" PRIMARY KEY ("id")
            )
        `);

        // 3. Add Foreign Key for Project Type (Dynamic Relationship)
        await queryRunner.query(`
            ALTER TABLE "projects" 
            ADD CONSTRAINT "FK_project_type" 
            FOREIGN KEY ("project_type_id") 
            REFERENCES "project_types"("id") ON DELETE RESTRICT
        `);

        // 4. Add Foreign Keys for Managers, Leads, Creators, and Clients
        await queryRunner.query(`
            ALTER TABLE "projects" 
            ADD CONSTRAINT "FK_project_manager" 
            FOREIGN KEY ("project_manager_id") 
            REFERENCES "admin_profiles"("id") ON DELETE RESTRICT
        `);

        await queryRunner.query(`
            ALTER TABLE "projects" 
            ADD CONSTRAINT "FK_project_lead" 
            FOREIGN KEY ("project_lead_id") 
            REFERENCES "employee_profiles"("id") ON DELETE RESTRICT
        `);

        await queryRunner.query(`
            ALTER TABLE "projects" 
            ADD CONSTRAINT "FK_project_creator" 
            FOREIGN KEY ("created_by") 
            REFERENCES "admin_profiles"("id") ON DELETE RESTRICT
        `);

        await queryRunner.query(`
            ALTER TABLE "projects" 
            ADD CONSTRAINT "FK_project_client" 
            FOREIGN KEY ("client_id") 
            REFERENCES "clients"("id") ON DELETE SET NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop Constraints first
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_project_client"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_project_creator"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_project_lead"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_project_manager"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_project_type"`);
        
        // Drop Table
        await queryRunner.query(`DROP TABLE "projects"`);
        
        // Drop Enum
        await queryRunner.query(`DROP TYPE "public"."projects_status_enum"`);
    }
}