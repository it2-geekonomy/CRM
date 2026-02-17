import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  Repository,
  MoreThanOrEqual,
  LessThanOrEqual,
  FindOptionsWhere,
} from 'typeorm';

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
  ) {}

  async create(dto: CreateTaskDto, userId: string) {
    const [assignedTo, assignedBy] = await Promise.all([
      this.employeeRepo.findOne({ where: { id: dto.assignedToId } }),
      this.employeeRepo.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      }),
    ]);

    if (!assignedTo || !assignedBy) {
      throw new BadRequestException('Invalid employee reference');
    }

    const task = this.taskRepo.create({
      ...dto,
      assignedTo,
      assignedBy,
      project: { id: dto.projectId } as any,
    });

    const savedTask = await this.taskRepo.save(task);

    return {
      id: savedTask.id,
      taskName: savedTask.taskName,
      taskStatus: savedTask.taskStatus,
      createdAt: savedTask.createdAt,
    };
  }

  async findCalendar(query: GetCalendarDto, userId: string, userRole: string) {
    try {
      const { year, month, employeeId } = query;
      const where: FindOptionsWhere<Task> = {};

      if (userRole === 'employee') {
        where.assignedTo = { user: { id: userId } } as any;
      } else if (userRole === 'admin' && employeeId) {
        where.assignedTo = { id: employeeId } as any;
      }

      if (year && month) {
        const monthStart = new Date(Number(year), Number(month) - 1, 1, 0, 0, 0);
        const monthEnd = new Date(Number(year), Number(month), 0, 23, 59, 59);
        where.startDate = LessThanOrEqual(monthEnd) as any;
        where.endDate = MoreThanOrEqual(monthStart) as any;
      }

      return await this.taskRepo.find({
        where,
        relations: ['assignedTo', 'assignedBy', 'project'],
        order: {
          startDate: 'ASC',
          startTime: 'ASC',
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Could not retrieve calendar data.`,
      );
    }
  }

  async findAll(): Promise<Task[]> {
    return this.taskRepo.find({
      relations: ['assignedTo', 'assignedBy', 'project'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['assignedTo', 'assignedBy', 'project'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: string, dto: UpdateTaskDto) {
    const task = await this.taskRepo.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    this.taskRepo.merge(task, dto);
    const updated = await this.taskRepo.save(task);

    return {
      id: updated.id,
      taskName: updated.taskName,
      taskStatus: updated.taskStatus,
      updatedAt: updated.updatedAt,
    };
  }

  async remove(id: string): Promise<void> {
    const result = await this.taskRepo.delete(id);

    if (!result.affected) {
      throw new NotFoundException('Task not found');
    }
  }

  async changeStatus(
    taskId: string,
    newStatus: TaskStatus,
    changedById: string,
    reason?: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const task = await manager.findOne(Task, { where: { id: taskId } });
      if (!task) {
        throw new NotFoundException('Task not found');
      }

      if (task.taskStatus === newStatus) {
        throw new BadRequestException(`Task already in ${newStatus}`);
      }

      const employee = await manager.findOne(EmployeeProfile, {
        where: { id: changedById },
      });
      if (!employee) {
        throw new BadRequestException('Invalid employee');
      }

      const oldStatus = task.taskStatus;
      task.taskStatus = newStatus;

      await manager.save(task);

      const activity = manager.create(TaskActivity, {
        task,
        oldStatus,
        newStatus,
        changedBy: employee,
        changeReason: reason,
      });

      await manager.save(activity);

      return {
        taskId: task.id,
        oldStatus,
        newStatus,
        changedAt: activity.changedAt,
        changedBy: {
          id: employee.id,
          name: employee.name,
        },
      };
    });
  }

  async getTaskActivity(taskId: string) {
    const exists = await this.taskRepo.exist({ where: { id: taskId } });

    if (!exists) {
      throw new NotFoundException('Task not found');
    }

    return this.taskActivityRepo.find({
      where: { task: { id: taskId } },
      relations: { changedBy: true },
      select: {
        id: true,
        oldStatus: true,
        newStatus: true,
        changeReason: true,
        changedAt: true,
        changedBy: {
          id: true,
          name: true,
          designation: true,
        },
      },
      order: { changedAt: 'ASC' },
    });
  }
}
