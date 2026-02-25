import { DataSource } from 'typeorm';
import { ProjectType } from '../../src/modules/project-type/entities/project-type.entity';
import { getDatabaseConfig } from '../config';

/**
 * Seeder: Create Project Types
 * Creates default project categories for assignment.
 * Skips if data already exists.
 */
async function seedProjectTypes() {
  const dataSource = new DataSource({
    ...getDatabaseConfig(),
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected for Project Types');

    const repo = dataSource.getRepository(ProjectType);
    
    const count = await repo.count();
    if (count > 0) {
      console.log('⚠️ Project Types already exist. Skipping seeder.');
      return;
    }

    const types = repo.create([
      { name: 'Website Development', description: 'Web applications and sites', isActive: true },
      { name: 'Mobile App', description: 'iOS and Android development', isActive: true },
      { name: 'UI/UX Design', description: 'Interface and experience design', isActive: true },
      { name: 'Digital Marketing', description: 'SEO and Social Media management', isActive: true },
    ]);

    await repo.save(types);
    console.log('✅ Created Project Types: Website, Mobile, UI/UX, Marketing');
  } catch (error) {
    console.error('❌ Error running Project Type seeder:', error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log('✅ Database connection closed');
  }
}

if (require.main === module) {
  seedProjectTypes()
    .then(() => { process.exit(0); })
    .catch((error) => { console.error(error); process.exit(1); });
}

export { seedProjectTypes };