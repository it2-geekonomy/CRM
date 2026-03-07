import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, In } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../task/entities/task.entity';
import { EmployeeProfile } from '../employee/entities/employee-profile.entity';
import { TaskStatus } from 'src/shared/enum/task/task-status.enum';
import { ProjectStatus } from 'src/shared/enum/project/project-status.enum';
import { TaskQueryDto } from '../task/dto/task-query.dto';
@Injectable()
export class EmployeeDashboardService {
  constructor(
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    @InjectRepository(EmployeeProfile) private readonly employeeRepo: Repository<EmployeeProfile>,
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

    const [tasksThisWeek, completedTasksCount] = await Promise.all([
      this.taskRepo.find({
        where: {
          assignedTo: { id: employee.id },
          createdAt: MoreThanOrEqual(startOfWeek),
        },
        relations: ['project'],
      }),
      this.taskRepo.count({
        where: {
          assignedTo: { id: employee.id },
          status: TaskStatus.ADDRESSED,
        },
      }),
    ]);

    let totalHours = 0;

    for (const task of tasksThisWeek) {
      if (task.startDate && task.startTime && task.endDate && task.endTime) {
        const start = new Date(`${task.startDate}T${task.startTime}`);
        const end = new Date(`${task.endDate}T${task.endTime}`);
        const diff = end.getTime() - start.getTime();

        if (diff > 0) totalHours += diff / (1000 * 60 * 60);
      }
    }

    const projectIds = [
      ...new Set(tasksThisWeek.map((t) => t.project?.id).filter(Boolean)),
    ];

    let activeProjectsCount = 0;

    if (projectIds.length) {
      activeProjectsCount = await this.projectRepo.count({
        where: {
          id: In(projectIds),
          status: ProjectStatus.ACTIVE,
        },
      });
    }

    return {
      activeProjects: {
        value: activeProjectsCount,
        delta: '↑ 0 from last week',
      },
      tasksThisWeek: {
        value: tasksThisWeek.length,
        delta: `↑ ${completedTasksCount} completed`,
      },
      hoursLogged: {
        value: `${totalHours.toFixed(1)}h`,
        delta: '↑ 0h from last week',
      },
      teamMembers: {
        value: 1,
        delta: 'No change',
      },
    };
  }

  async getTasksPaginated(userId: string, query: TaskQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'task.startDate',
      sortOrder = 'DESC',
      projectId,
      taskTypeId,
      priority,
      date,
    } = query;

    const employee = await this.employeeRepo.findOne({
      where: { user: { id: userId }, isActive: true },
    });

    if (!employee) throw new NotFoundException('Employee not found');

    const qb = this.taskRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.assignedBy', 'assignedBy')
      .leftJoinAndSelect('task.taskType', 'taskType')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .where('assignedTo.id = :employeeId', { employeeId: employee.id });

    if (search) {
      qb.andWhere(
        `(task.name ILIKE :search
        OR project.name ILIKE :search
        OR taskType.name ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    if (projectId) { qb.andWhere('project.id = :projectId', { projectId }); }
    if (taskTypeId) { qb.andWhere('taskType.id = :taskTypeId', { taskTypeId }); }
    if (priority) { qb.andWhere('task.priority = :priority', { priority }); }
    if (date) { qb.andWhere('task.startDate <= :date AND task.endDate >= :date', { date },); }

    qb.orderBy('task.createdAt', 'DESC');

    qb.skip((Number(page) - 1) * Number(limit))
      .take(Number(limit));

    const [tasks, total] = await qb.getManyAndCount();

    return {
      data: tasks,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }
}