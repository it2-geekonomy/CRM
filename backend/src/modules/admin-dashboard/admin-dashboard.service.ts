import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../task/entities/task.entity';
import { UsersService } from '../users/users.service';
import { TaskService } from '../task/task.service';
import { ProjectStatus } from '../../shared/enum/project/project-status.enum';
import { TaskStatus } from '../../shared/enum/task/task-status.enum';
import { TaskQueryDto } from '../task/dto/task-query.dto';

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


        const lastWeekStart = new Date(firstDay);
        lastWeekStart.setDate(firstDay.getDate() - 7);

        const lastWeekEnd = new Date(lastDay);
        lastWeekEnd.setDate(lastDay.getDate() - 7);

        const lastWeekStartStr = lastWeekStart.toISOString().split('T')[0];
        const lastWeekEndStr = lastWeekEnd.toISOString().split('T')[0];

        const [activeProjects, allUsers] = await Promise.all([
            this.projectRepo.count({ where: { status: ProjectStatus.ACTIVE } }),
            this.usersService.findAll(),
        ]);

        const tasksThisWeek = await this.taskService.getPendingTasksForWeek();

        const tasksLastWeek = await this.taskRepo.count({
            where: {
                status: TaskStatus.ADDRESSED,
                endDate: Between(lastWeekStartStr, lastWeekEndStr),
            },
        });

        const completedTasksThisWeek = await this.taskRepo.find({
            where: {
                status: TaskStatus.ADDRESSED,
                endDate: Between(startOfWeek, endOfWeek),
            },
        });

        const completedTasksLastWeek = await this.taskRepo.find({
            where: {
                status: TaskStatus.ADDRESSED,
                endDate: Between(lastWeekStartStr, lastWeekEndStr),
            },
        });

        const calculateHours = (tasks: Task[]) =>
            tasks.reduce((sum, task) => {
                const start = new Date(`${task.startDate}T${task.startTime}`);
                const end = new Date(`${task.endDate}T${task.endTime}`);
                const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                return sum + hours;
            }, 0);

        const hoursThisWeek = calculateHours(completedTasksThisWeek);
        const hoursLastWeek = calculateHours(completedTasksLastWeek);

        return {
            activeProjects: {
                value: activeProjects,
                delta: '↑3 from last week',
            },
            tasksThisWeek: {
                value: tasksThisWeek,
                delta: `${completedTasksThisWeek.length - tasksLastWeek} completed`,
            },
            hoursLogged: {
                value: `${hoursThisWeek.toFixed(1)}h`,
                delta: `${(hoursThisWeek - hoursLastWeek).toFixed(1)}h from last week`,
            },
            teamMembers: {
                value: allUsers.length,
                delta: 'No change',
            },
        };
    }

    async getAllTasks(query: TaskQueryDto) {
        return this.taskService.findAll(query);
    }
}