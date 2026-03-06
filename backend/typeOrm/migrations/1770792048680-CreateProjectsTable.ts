import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProjectsTable1770792048680 implements MigrationInterface {
    name = 'CreateProjectsTable1770792048680'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1️⃣ Create Updated Enum Type
        await queryRunner.query(`
            CREATE TYPE "public"."projects_status_enum" 
            AS ENUM('Active', 'Inactive', 'Pipeline', 'Completed')
        `);

        // 2️⃣ Create Projects Table
        await queryRunner.query(`
            CREATE TABLE "projects" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "name" character varying(150) NOT NULL, 
                "code" character varying(50) NOT NULL, 
                "project_type_id" uuid NOT NULL, 
                "description" text, 
                "status" "public"."projects_status_enum" NOT NULL DEFAULT 'Active', 
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

        // 3️⃣ Foreign Keys for Projects
        await queryRunner.query(`
            ALTER TABLE "projects" 
            ADD CONSTRAINT "FK_project_type" 
            FOREIGN KEY ("project_type_id") 
            REFERENCES "project_types"("id") ON DELETE RESTRICT
        `);

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

        // 4️⃣ Create join table for project team members
        await queryRunner.query(`
            CREATE TABLE "project_team_members" (
                "project_id" uuid NOT NULL,
                "employee_id" uuid NOT NULL,
                PRIMARY KEY ("project_id", "employee_id")
            )
        `);

        // 5️⃣ Add foreign keys for join table
        await queryRunner.query(`
            ALTER TABLE "project_team_members"
            ADD CONSTRAINT "FK_project_team_project"
            FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "project_team_members"
            ADD CONSTRAINT "FK_project_team_employee"
            FOREIGN KEY ("employee_id") REFERENCES "employee_profiles"("id") ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1️⃣ Drop join table first
        await queryRunner.query(`DROP TABLE "project_team_members"`);

        // 2️⃣ Drop foreign keys for projects
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_project_client"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_project_creator"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_project_lead"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_project_manager"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_project_type"`);

        // 3️⃣ Drop projects table
        await queryRunner.query(`DROP TABLE "projects"`);

        // 4️⃣ Drop enum type
        await queryRunner.query(`DROP TYPE "public"."projects_status_enum"`);
    }
}