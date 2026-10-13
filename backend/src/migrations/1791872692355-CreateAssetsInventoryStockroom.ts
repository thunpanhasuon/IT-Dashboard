import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAssetsInventoryStockroom1791872692355 implements MigrationInterface {
    name = 'CreateAssetsInventoryStockroom1791872692355'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "assets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(200) NOT NULL, "brand" character varying(100) NOT NULL, "model" character varying(100) NOT NULL, "specs" character varying(200) NOT NULL, "assignedTo" character varying(200), "status" character varying(50) NOT NULL DEFAULT 'Available', "location" character varying(200) NOT NULL, "lastUpdated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_da96729a8b113377cfb6a62439c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."inventory_status_enum" AS ENUM('In Stock', 'Low Stock', 'Out of Stock')`);
        await queryRunner.query(`CREATE TABLE "inventory" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(200) NOT NULL, "category" character varying(100) NOT NULL, "quantity" integer NOT NULL DEFAULT '0', "reorderLevel" integer NOT NULL DEFAULT '0', "unit" character varying(50) NOT NULL, "status" "public"."inventory_status_enum" NOT NULL DEFAULT 'Out of Stock', "location" character varying(200) NOT NULL, "lastUpdated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_82aa5da437c5bbfb80703b08309" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "stockroom" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(200) NOT NULL, "quantity" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_62a3d8aa5405793dbd6764d424d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "stockroom"`);
        await queryRunner.query(`DROP TABLE "inventory"`);
        await queryRunner.query(`DROP TYPE "public"."inventory_status_enum"`);
        await queryRunner.query(`DROP TABLE "assets"`);
    }

}
