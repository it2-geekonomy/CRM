import { DataSource } from 'typeorm';
import { Department } from '../../src/modules/department/entities/department.entity';
import { getDatabaseConfig } from '../config';

/**
 * Seeder: Create Departments
 *
 * Creates default departments for employee assignment.
 * Skips if departments already exist.
 *
 * Run with: pnpm seed:departments (or as part of seed:all)
 * Order: After users; before employee profiles.
 */

async function seedDepartments() {
  const dataSource = new DataSource({
    ...getDatabaseConfig(),
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    const repo = dataSource.getRepository(Department);
    const existing = await repo.find();
    if (existing.length > 0) {
      console.log('⚠️  Departments already exist. Skipping seeder.');
      return;
    }

    const departments = repo.create([
      { name: 'Engineering', code: 'ENG', description: 'Software development and technical teams' },
      { name: 'Product', code: 'PROD', description: 'Product management and design' },
      { name: 'Operations', code: 'OPS', description: 'Operations and support' },
    ]);

    await repo.save(departments);
    console.log('✅ Created 3 departments: Engineering, Product, Operations');
  } catch (error) {
    console.error('❌ Error running departments seeder:', error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log('✅ Database connection closed');
  }
}

if (require.main === module) {
  seedDepartments()
    .then(() => { console.log('✅ Seeder finished'); process.exit(0); })
    .catch((error) => { console.error('❌ Seeder failed:', error); process.exit(1); });
}

export { seedDepartments };
