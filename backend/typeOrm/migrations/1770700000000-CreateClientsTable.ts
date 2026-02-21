import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateClientsTable1770700000000 implements MigrationInterface {
  name = 'CreateClientsTable1770700000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ONLY create the clients table here
    await queryRunner.query(`
      CREATE TABLE "clients" (
        "client_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(150) NOT NULL,
        "email" varchar(150) NOT NULL UNIQUE,
        "phone" varchar(20),
        "company" varchar(150),
        "status" boolean DEFAULT true,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        CONSTRAINT "PK_clients" PRIMARY KEY ("client_id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "clients"`);
  }
}