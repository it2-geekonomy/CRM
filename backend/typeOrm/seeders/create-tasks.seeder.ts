import { DataSource } from 'typeorm';
import { Task } from '../../src/modules/task/entities/task.entity';
import { TaskType } from '../../src/modules/task-type/entities/task-type.entity';
import { EmployeeProfile } from '../../src/modules/employee/entities/employee-profile.entity';
import { Project } from '../../src/modules/projects/entities/project.entity';
import { TaskPriority } from '../../src/shared/enum/task/task-priority.enum';
import { TaskStatus } from '../../src/shared/enum/task/task-status.enum';
import { getDatabaseConfig } from '../config';

/**
 * Seeder: Create Tasks
 * Order: Must run AFTER seedTaskTypes, seedProjects & seedEmployees
 */
async function seedTasks() {
    const dataSource = new DataSource({
        ...getDatabaseConfig(),
        synchronize: false,
    });

    try {
        await dataSource.initialize();
        console.log('✅ Database connected');

        const taskRepo = dataSource.getRepository(Task);
        const taskTypeRepo = dataSource.getRepository(TaskType);
        const employeeRepo = dataSource.getRepository(EmployeeProfile);
        const projectRepo = dataSource.getRepository(Project);

        // Prevent duplicate seeding
        const existingCount = await taskRepo.count();
        if (existingCount > 0) {
            console.log('⚠️ Tasks already exist. Skipping seeder.');
            return;
        }

        const taskTypes = await taskTypeRepo.find();
        const project = (await projectRepo.find({ take: 1 }))[0];
        const employee = (await employeeRepo.find({ take: 1 }))[0];

        if (!taskTypes.length || !project || !employee) {
            console.error('❌ Required data missing. Run other seeders first.');
            return;
        }

        const tasksToCreate: Task[] = [];

        for (const taskType of taskTypes) {
            let taskNames: string[] = [];

            switch (taskType.name) {
                case 'Client Follow-up':
                    taskNames = [
                        'Initial Client Requirement Discussion – Enterprise Account',
                        'Follow-up on Submitted Proposal – Corporate Client',
                        'Contract Negotiation & Closure Discussion',
                    ];
                    break;

                case 'UI/UX Design':
                    taskNames = [
                        'CRM Dashboard Wireframe Finalization',
                        'Mobile Application UI Design – Phase 1',
                        'User Experience Improvements – Lead Management Module',
                    ];
                    break;

                case 'Feature Implementation':
                    taskNames = [
                        'Authentication & Role Management Implementation',
                        'Task Management Module Development',
                        'Reporting & Analytics API Integration',
                    ];
                    break;

                case 'Social Media Strategy':
                    taskNames = [
                        'Monthly Social Media Campaign Planning',
                        'Content Calendar Preparation – Q2',
                        'Performance Analysis & Engagement Optimization',
                    ];
                    break;
            }

            for (const name of taskNames) {
                const task = taskRepo.create({
                    name,
                    description: `${name} – Auto generated seed task`,
                    startDate: '2026-02-13',
                    startTime: '10:00',
                    endDate: '2026-02-15',
                    endTime: '18:00',
                    assignedTo: employee,
                    assignedBy: employee,
                    project: project,
                    priority: TaskPriority.HIGH,
                    taskType: taskType,
                });

                tasksToCreate.push(task);
            }
        }

        await taskRepo.save(tasksToCreate);
        console.log('✅ Tasks seeded successfully');

    } catch (error) {
        console.error('❌ Error running Task seeder:', error);
        throw error;
    } finally {
        await dataSource.destroy();
        console.log('✅ Database connection closed');
    }
}

// Allow standalone execution
if (require.main === module) {
    seedTasks()
        .then(() => {
            console.log('✅ Seeder finished');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Seeder failed:', error);
            process.exit(1);
        });
}

export { seedTasks };