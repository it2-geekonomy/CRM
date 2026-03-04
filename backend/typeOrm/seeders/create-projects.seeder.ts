import { DataSource } from 'typeorm';
import { Project } from '../../src/modules/projects/entities/project.entity';
import { ProjectType } from '../../src/modules/project-type/entities/project-type.entity';
import { AdminProfile } from '../../src/modules/admin/entities/admin-profile.entity';
import { EmployeeProfile } from '../../src/modules/employee/entities/employee-profile.entity';
import { Client } from '../../src/modules/client/entities/client.entity';
import { ProjectStatus } from '../../src/shared/enum/project/project-status.enum';
import { getDatabaseConfig } from '../config';

/**
 * Seeder: Create Projects
 * Order: Must run AFTER seedProjectTypes, seedAdmins, seedEmployees, seedClients
 */
async function seedProjects() {
  const dataSource = new DataSource({
    ...getDatabaseConfig(),
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    const projectRepo = dataSource.getRepository(Project);
    const typeRepo = dataSource.getRepository(ProjectType);
    const adminRepo = dataSource.getRepository(AdminProfile);
    const employeeRepo = dataSource.getRepository(EmployeeProfile);
    const clientRepo = dataSource.getRepository(Client);

    const existingCount = await projectRepo.count();
    if (existingCount > 0) {
      console.log('⚠️ Projects already exist. Skipping seeder.');
      return;
    }

    const projectType = await typeRepo.findOneBy({ name: 'Website Development' });
    const manager = (await adminRepo.find({ take: 1 }))[0];
    const lead = (await employeeRepo.find({ take: 1 }))[0];
    const client = (await clientRepo.find({ take: 1 }))[0];

    if (!projectType || !manager || !lead) {
      console.error('❌ Required relations missing. Run dependency seeders first.');
      return;
    }

    const projectsToCreate: Project[] = [];

    const projectData = [
      {
        name: 'School ERP System',
        code: 'SCH-ERP-001',
        description: 'Complete school management system',
        status: ProjectStatus.ACTIVE,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-06-30'),
        estimatedHours: 500,
        requireTimeTracking: true,
        enableNotifications: true,
        enableClientPortal: true,
      },
      {
        name: 'Online Examination System',
        code: 'EXAM-001',
        description: 'Digital examination system',
        status: ProjectStatus.PIPELINE,
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-07-01'),
        estimatedHours: 300,
        requireTimeTracking: false,
        enableNotifications: true,
        enableClientPortal: false,
      },
    ];

    for (const data of projectData) {
      const project = projectRepo.create({
        ...data,
        projectType,
        projectManager: manager,
        projectLead: lead,
        client: client ?? null,
        createdBy: manager.id,
      });

      projectsToCreate.push(project);
    }

    await projectRepo.save(projectsToCreate);

    console.log('✅ Projects seeded successfully');

  } catch (error) {
    console.error('❌ Error running Project seeder:', error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log('✅ Database connection closed');
  }
}

if (require.main === module) {
  seedProjects()
    .then(() => {
      console.log('✅ Seeder finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeder failed:', error);
      process.exit(1);
    });
}

export { seedProjects };