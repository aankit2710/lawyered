import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial schema bootstrap for production.
 * Creates tables from entity metadata when they do not yet exist.
 */
export class InitialSchema1738790000000 implements MigrationInterface {
  name = 'InitialSchema1738790000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasUsers = await queryRunner.hasTable('users');
    if (!hasUsers) {
      await queryRunner.connection.synchronize();
    }
  }

  public async down(): Promise<void> {
    // Intentionally empty — production rollback requires manual DBA review.
  }
}
