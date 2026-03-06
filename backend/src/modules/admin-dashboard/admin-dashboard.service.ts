import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../task/entities/task.entity';
import { UsersService } from '../users/users.service';
import { TaskService } from '../task/task.service';
import { ProjectStatus } from '../../shared/enum/project/project-status.enum';
import { TaskStatus } from '../../shared/enum/task/task-status.enum';

@Injectable()
export class AdminDashboardService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepo: Repository<Project>,

        @InjectRepository(Task)
        private readonly taskRepo: Repository<Task>,

        private readonly usersService: UsersService,
        private readonly taskService: TaskService,
    ) { }

    async getDashboardStats() {
        const today = new Date();
        const firstDay = new Date(today.setDate(today.getDate() - today.getDay() + 1));
        const lastDay = new Date(today.setDate(firstDay.getDate() + 6));
        const startOfWeek = firstDay.toISOString().split('T')[0];
        const endOfWeek = lastDay.toISOString().split('T')[0];

        const [activeProjects, tasksThisWeek, allUsers] = await Promise.all([
            this.projectRepo.count({ where: { status: ProjectStatus.ACTIVE } }),
            this.taskService.getPendingTasksForWeek(), 
            this.usersService.findAll(),
        ]);

        const completedTasks = await this.taskRepo.find({
            where: {
                status: TaskStatus.ADDRESSED,
                endDate: Between(startOfWeek, endOfWeek),
            },
        });

        const totalHours = completedTasks.reduce((sum, task) => {
            const start = new Date(`${task.startDate}T${task.startTime}`);
            const end = new Date(`${task.endDate}T${task.endTime}`);
            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            return sum + hours;
        }, 0);

        return {
            activeProjects: {
                value: activeProjects,
            },
            tasksThisWeek: {
                value: tasksThisWeek, 
            },
            hoursLogged: {
                value: `${totalHours.toFixed(1)}h`, 
            },
            teamMembers: {
                value: allUsers.length,
            },
        };
    }
}