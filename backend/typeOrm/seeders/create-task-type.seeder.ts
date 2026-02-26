import { DataSource } from 'typeorm';
import { TaskType } from '../../src/modules/task-type/entities/task-type.entity';
import { Department } from '../../src/modules/department/entities/department.entity';
import { TaskTypeStatus } from '../../src/shared/enum/task/task-type-status.enum';
import { getDatabaseConfig } from '../config';

/**
 * Seeder: Create Task Types
 * * Creates default task types mapped to specific departments.
 * Order: Must run AFTER seedDepartments.
 */
async function seedTaskTypes() {
    const dataSource = new DataSource({
        ...getDatabaseConfig(),
        synchronize: false,
    });

    try {
        await dataSource.initialize();
        console.log('✅ Database connected');

        const taskTypeRepo = dataSource.getRepository(TaskType);
        const departmentRepo = dataSource.getRepository(Department);

        // Check if task types already exist to avoid duplicates
        const existingCount = await taskTypeRepo.count();
        if (existingCount > 0) {
            console.log('⚠️  Task Types already exist. Skipping seeder.');
            return;
        }

        // Fetch department references using the codes from your department seeder
        const salesDept = await departmentRepo.findOneBy({ code: 'SALES' });
        const designDept = await departmentRepo.findOneBy({ code: 'DES' });
        const devDept = await departmentRepo.findOneBy({ code: 'DEV' });
        const smDept = await departmentRepo.findOneBy({ code: 'SM' });

        if (!salesDept || !designDept || !devDept || !smDept) {
            console.error('❌ Required departments not found. Run department seeder first.');
            return;
        }

        const taskTypes = taskTypeRepo.create([
            {
                name: 'Client Follow-up',
                description: 'Follow-up calls and meetings with potential clients',
                department: salesDept,
                billable: true,
                slaHours: 48,
                status: TaskTypeStatus.ACTIVE,
            },
            {
                name: 'UI/UX Design',
                description: 'Creating user interfaces and visual communication mockups',
                department: designDept,
                billable: true,
                slaHours: 40,
                status: TaskTypeStatus.ACTIVE,
            },
            {
                name: 'Feature Implementation',
                description: 'Developing and coding new software requirements',
                department: devDept,
                billable: true,
                slaHours: 72,
                status: TaskTypeStatus.ACTIVE,
            },
            {
                name: 'Social Media Strategy',
                description: 'Managing marketing content and online engagement',
                department: smDept,
                billable: true,
                slaHours: 24,
                status: TaskTypeStatus.ACTIVE,
            },
        ]);

        await taskTypeRepo.save(taskTypes);
        console.log('✅ Task Types seeded successfully');

    } catch (error) {
        console.error('❌ Error running Task Types seeder:', error);
        throw error;
    } finally {
        await dataSource.destroy();
        console.log('✅ Database connection closed');
    }
}

// Allow standalone execution
if (require.main === module) {
    seedTaskTypes()
        .then(() => {
            console.log('✅ Seeder finished');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Seeder failed:', error);
            process.exit(1);
        });
}

export { seedTaskTypes };