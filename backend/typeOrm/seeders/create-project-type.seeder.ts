import { DataSource } from 'typeorm';
import { ProjectType } from '../../src/modules/project-type/entities/project-type.entity';
import { Department } from '../../src/modules/department/entities/department.entity';
import { getDatabaseConfig } from '../config';

async function seedProjectTypes() {
  const dataSource = new DataSource({
    ...getDatabaseConfig(),
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    const repo = dataSource.getRepository(ProjectType);
    const deptRepo = dataSource.getRepository(Department);

    if (await repo.count()) {
      console.log('⚠️ Project Types already exist, skipping...');
      return;
    }

    const devDept = await deptRepo.findOneBy({ code: 'DEV' });
    const designDept = await deptRepo.findOneBy({ code: 'DES' });
    const salesDept = await deptRepo.findOneBy({ code: 'SALES' });

    if (!devDept || !designDept || !salesDept) {
      throw new Error('Required departments (DEV, DES, SALES) not found in database.');
    }

    const typesData = [
      {
        name: 'Website Development',
        description: 'Web applications',
        department: devDept,
        isActive: true,
      },
      {
        name: 'Mobile App Development',
        description: 'iOS & Android apps',
        department: devDept,
        isActive: true,
      },
      {
        name: 'UI/UX Design',
        description: 'Design related projects',
        department: designDept,
        isActive: true,
      },
      {
        name: 'Sales Campaign',
        description: 'Sales and marketing campaigns',
        department: salesDept,
        isActive: true,
      },
    ];

    const types = repo.create(typesData);
    await repo.save(types);

    console.log('✅ Created Project Types successfully');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await dataSource.destroy();
  }
}

if (require.main === module) {
  seedProjectTypes()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedProjectTypes };