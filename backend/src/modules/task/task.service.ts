import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { EmployeeProfile } from 'src/modules/employee/entities/employee-profile.entity';
import { TaskStatus } from 'src/shared/enum/task/task-status.enum';
import { TaskActivity } from './entities/task-activity.entity';
import { GetCalendarDto } from './dto/get-calendar.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(EmployeeProfile)
    private readonly employeeRepo: Repository<EmployeeProfile>,
    @InjectRepository(TaskActivity)
    private readonly taskActivityRepo: Repository<TaskActivity>,
    private readonly dataSource: DataSource,
  ) { }

  private baseTaskQuery() {
    return this.taskRepo
      .createQueryBuilder('task')
      .leftJoin('task.assignedTo', 'assignedTo')
      .leftJoin('task.assignedBy', 'assignedBy')
      .leftJoin('task.project', 'project')
      .select([
        'task.id',
        'task.taskName',
        'task.taskStatus',
        'task.startDate',
        'task.startTime',
        'task.endDate',
        'task.endTime',
        'task.createdAt',
        'task.updatedAt',
        'assignedTo.id',
        'assignedTo.name',
        'assignedTo.designation',
        'assignedBy.id',
        'assignedBy.name',
        'project.projectId',
        'project.projectName',
      ]);
  }

  async create(dto: CreateTaskDto, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const [assignedTo, assignedBy, project] = await Promise.all([
        manager.findOne(EmployeeProfile, { where: { id: dto.assignedToId } }),
        manager.findOne(EmployeeProfile, { where: { user: { id: userId } } }),
        manager.findOne('Project', { where: { projectId: dto.projectId } }),
      ]);



      if (!assignedTo) throw new BadRequestException('Invalid assignedTo ID');
      if (!assignedBy) throw new BadRequestException('Invalid assignedBy ID');
      if (!project) throw new BadRequestException('Invalid project ID');

      const task = manager.create(Task, {
        ...dto,
        assignedTo,
        assignedBy,
        project,
      });

      const savedTask = await manager.save(task);

      return {
        id: savedTask.id,
        taskName: savedTask.taskName,
        taskStatus: savedTask.taskStatus,
        createdAt: savedTask.createdAt,
      };
    });
  }

  async findAll() {
    return this.baseTaskQuery().orderBy('task.createdAt', 'DESC').getRawMany();
  }

  async findOne(id: string) {
    const task = await this.baseTaskQuery()
      .where('task.id = :id', { id })
      .getRawOne();

    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async findCalendar(query: GetCalendarDto, userId: string, userRole: string) {
    const qb = this.baseTaskQuery();

    if (userRole === 'employee') {
      qb.andWhere('assignedTo.id = :userId', { userId });
    } else if (userRole === 'admin' && query.employeeId) {
      qb.andWhere('assignedTo.id = :empId', { empId: query.employeeId });
    }

    if (query.year && query.month) {
      const start = new Date(Number(query.year), Number(query.month) - 1, 1, 0, 0, 0);
      const end = new Date(Number(query.year), Number(query.month), 0, 23, 59, 59);
      qb.andWhere('task.startDate <= :end AND task.endDate >= :start', { start, end });
    }

    return qb.orderBy('task.startDate', 'ASC')
      .addOrderBy('task.startTime', 'ASC')
      .getRawMany();
  }

  async update(id: string, dto: UpdateTaskDto) {
    const updated = await this.taskRepo.save({ id, ...dto });
    return {
      id: updated.id,
      taskName: updated.taskName,
      taskStatus: updated.taskStatus,
      updatedAt: updated.updatedAt,
    };
  }

  async remove(id: string) {
    const result = await this.taskRepo.delete(id);
    if (!result.affected) throw new NotFoundException('Task not found');
  }

  async changeStatus(taskId: string, newStatus: TaskStatus, changedById: string, reason?: string) {
    return this.dataSource.transaction(async (manager) => {
      const task = await manager.findOne(Task, { where: { id: taskId } });
      if (!task) throw new NotFoundException('Task not found');
      if (task.taskStatus === newStatus) throw new BadRequestException(`Task already in ${newStatus}`);

      const employee = await manager.findOne(EmployeeProfile, { where: { id: changedById } });
      if (!employee) throw new BadRequestException('Invalid employee');

      const oldStatus = task.taskStatus;
      task.taskStatus = newStatus;

      const activity = manager.create(TaskActivity, {
        task,
        oldStatus,
        newStatus,
        changedBy: employee,
        changeReason: reason,
      });

      await manager.save([task, activity]);

      return {
        taskId: task.id,
        oldStatus,
        newStatus,
        changedAt: activity.changedAt,
        changedBy: { id: employee.id, name: employee.name },
      };
    });
  }

  async getTaskActivity(taskId: string) {
    const exists = await this.taskRepo.exist({ where: { id: taskId } });
    if (!exists) throw new NotFoundException('Task not found');

    return this.taskActivityRepo.find({
      where: { task: { id: taskId } },
      relations: { changedBy: true },
      select: {
        id: true,
        oldStatus: true,
        newStatus: true,
        changeReason: true,
        changedAt: true,
        changedBy: { id: true, name: true, designation: true },
      },
      order: { changedAt: 'ASC' },
    });
  }
}