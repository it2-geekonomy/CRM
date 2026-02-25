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
      {name: 'Sales',code: 'SALES',description: 'Handles client acquisition, revenue generation, and customer relationships'},
      {name: 'Design',code: 'DES',description: 'Responsible for UI/UX design, branding, and visual communication'},
      {name: 'Development',code: 'DEV',description: 'Handles software development, implementation, and technical architecture'},
      {name: 'Social Media',code: 'SM',description: 'Manages social media marketing, content strategy, and online engagement'},
    ]);

    await repo.save(departments);
    console.log('✅ Created 4 departments: Sales,Design,Development,Social Media');
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
