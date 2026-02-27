import { DataSource, In } from 'typeorm';
import { ProjectType } from '../../src/modules/project-type/entities/project-type.entity';
import { Department } from '../../src/modules/department/entities/department.entity';
import { getDatabaseConfig } from '../config';

// FIX: Added 'export' keyword for the Master Seeder
export async function seedProjectTypes() {
  const dataSource = new DataSource({
    ...getDatabaseConfig(),
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    const typeRepo = dataSource.getRepository(ProjectType);
    const deptRepo = dataSource.getRepository(Department);

    // 1. Array of Project Types with their associated Department Codes
    const seedData = [
      {
        name: 'Website Development',
        description: 'Web applications',
        isActive: true,
        deptCodes: ['DEV', 'DES'], // 1 Project Type -> 2 Departments
      },
      {
        name: 'Enterprise ERP',
        description: 'Large scale systems',
        isActive: true,
        deptCodes: ['DEV', 'DES', 'SALES'], // 1 Project Type -> 3 Departments
      },
    ];

    for (const data of seedData) {
      // 2. Find or Create the Project Type
      let projectType = await typeRepo.findOneBy({ name: data.name });
      if (!projectType) {
        projectType = typeRepo.create({
          name: data.name,
          description: data.description,
          isActive: data.isActive,
        });
        await typeRepo.save(projectType);
      }

      // 3. Find Departments by their codes
      const departments = await deptRepo.findBy({
        code: In(data.deptCodes),
      });

      if (departments.length > 0) {
        // 4. Link each department to this Project Type
        departments.forEach((dept) => {
          dept.projectType = projectType; 
        });

        // 5. Save the Departments (This updates the 'project_type_id' column)
        await deptRepo.save(departments);
        console.log(`✅ Linked "${data.name}" to departments: ${data.deptCodes.join(', ')}`);
      }
    }

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