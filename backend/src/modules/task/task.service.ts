import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { EmployeeProfile } from 'src/modules/employee/entities/employee-profile.entity';
import { TaskStatus } from 'src/shared/enum/task/task-status.enum';
import { TaskActivity } from './entities/task-activity.entity';

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
    });

    const savedTask = await this.taskRepo.save(task);

    return {
      id: savedTask.id,
      taskName: savedTask.taskName,
      taskStatus: savedTask.taskStatus,
      createdAt: savedTask.createdAt,
    };
  }

  private baseTaskQuery() {
    return this.taskRepo
      .createQueryBuilder('task')
      .leftJoin('task.assignedTo', 'assignedTo')
      .leftJoin('task.assignedBy', 'assignedBy')
      .select([
        'task.id',
        'task.taskName',
        'task.taskDescription',
        'task.startDate',
        'task.startTime',
        'task.endDate',
        'task.endTime',
        'task.taskStatus',
        'task.createdAt',
        'task.updatedAt',

        'assignedTo.id',
        'assignedTo.name',
        'assignedTo.designation',

        'assignedBy.id',
        'assignedBy.name',
      ]);
  }

  async findAll() {
    return this.baseTaskQuery()
      .orderBy('task.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string) {
    const task = await this.baseTaskQuery()
      .where('task.id = :id', { id })
      .getOne();

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
