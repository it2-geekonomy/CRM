import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, In } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../task/entities/task.entity';
import { EmployeeProfile } from '../employee/entities/employee-profile.entity';
import { TaskStatus } from 'src/shared/enum/task/task-status.enum';
import { ProjectStatus } from 'src/shared/enum/project/project-status.enum';

@Injectable()
export class EmployeeDashboardService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,

    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,

    @InjectRepository(EmployeeProfile)
    private readonly employeeRepo: Repository<EmployeeProfile>,
  ) { }

  async getStats(userId: string) {

    const employee = await this.employeeRepo.findOne({
      where: { user: { id: userId }, isActive: true },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const tasksThisWeek = await this.taskRepo.find({
      where: {
        assignedTo: { id: employee.id },
        createdAt: MoreThanOrEqual(startOfWeek),
      },
      relations: ['project'],
    });

    const completedTasksCount = await this.taskRepo.count({
      where: { assignedTo: { id: employee.id }, status: TaskStatus.ADDRESSED },
    });

    let totalHours = 0;
    tasksThisWeek.forEach((task) => {
      if (task.startDate && task.startTime && task.endDate && task.endTime) {
        const start = new Date(`${task.startDate}T${task.startTime}`);
        const end = new Date(`${task.endDate}T${task.endTime}`);
        const diffMs = end.getTime() - start.getTime();
        if (diffMs > 0) totalHours += diffMs / (1000 * 60 * 60);
      }
    });

    const projectIds = Array.from(
      new Set(tasksThisWeek.map((t) => t.project?.id).filter(Boolean))
    );
    const activeProjectsCount =
      projectIds.length > 0
        ? await this.projectRepo.count({
          where: { id: In(projectIds), status: ProjectStatus.ACTIVE },
        })
        : 0;


    return {
      activeProjects: { value: activeProjectsCount, delta: '↑ 0 from last week' },
      tasksThisWeek: { value: tasksThisWeek.length, delta: `↑ ${completedTasksCount} completed` },
      hoursLogged: { value: `${totalHours.toFixed(1)}h`, delta: '↑ 0h from last week' },
      teamMembers: { value: 1, delta: 'No change' },
    };
  }

  async getTasksPaginated(
    userId: string,
    page = 1,
    limit = 10,
    search?: string,
    sortBy = 'startDate',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{ data: Task[]; meta: any }> {

    const employee = await this.employeeRepo.findOne({
      where: { user: { id: userId }, isActive: true },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const whereCondition: any = {
      assignedTo: { id: employee.id },
    };

    if (search) {
      whereCondition.name = search;
    }

    const [tasks, total] = await this.taskRepo.findAndCount({
      where: whereCondition,
      relations: ['project', 'assignedBy', 'taskType'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: tasks,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}
