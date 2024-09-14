import { MigrationInterface, QueryRunner } from "typeorm";

export class Generated21726274842442 implements MigrationInterface {
    name = 'Generated21726274842442'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "item" RENAME COLUMN "title" TO "name"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "item" RENAME COLUMN "name" TO "title"`);
    }

}
