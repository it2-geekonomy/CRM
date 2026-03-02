import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateClientsTable1770700000000 implements MigrationInterface {
  name = 'CreateClientsTable1770700000000'

  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    await queryRunner.query(`
      CREATE TABLE "clients" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(150) NOT NULL,
        "client_code" varchar(50) UNIQUE,
        "logo_url" varchar,
        "industry" varchar(100),
        "company_size" varchar(50),
        "website" varchar(255),
        "tax_id" varchar(100),
        "street_address" text,
        "city" varchar(100),
        "state" varchar(100),
        "postal_code" varchar(20),
        "country" varchar(100),
        "phone" varchar(20),
        "email" varchar(150) NOT NULL UNIQUE,
        "contacts" jsonb,
        "payment_terms" varchar(50),
        "currency" varchar(50) NOT NULL DEFAULT 'INR - Indian Rupee',
        "payment_method" varchar(50),
        "credit_limit" decimal(15,2) NOT NULL DEFAULT 0,
        "billing_notes" text,
        "client_since" date,
        "sales_manager_id" uuid,
        "internal_notes" text,
        "status" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),

        CONSTRAINT "PK_clients_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_clients_sales_manager"
          FOREIGN KEY ("sales_manager_id")
          REFERENCES "employee_profiles"("id")
          ON DELETE SET NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "clients"`);
  }
}