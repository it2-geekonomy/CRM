import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, FindOptionsWhere } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { EmployeeProfile } from 'src/modules/employee/entities/employee-profile.entity';
import { GetCalendarDto } from './dto/get-calendar.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,

    @InjectRepository(EmployeeProfile)
    private readonly employeeRepo: Repository<EmployeeProfile>,
  ) { }

  // CREATE TASK
  async create(dto: CreateTaskDto, userId: string) {
    // assigned TO (from request)
    const assignedTo = await this.employeeRepo.findOne({
      where: { id: dto.assignedToId },
    });

    // assigned BY (from JWT user → employee)
    const assignedBy = await this.employeeRepo.findOne({
      where: {
        user: { id: userId },
      },
      relations: ['user'],
    });

    if (!assignedTo || !assignedBy) {
      throw new BadRequestException('Invalid employee reference');
    }

    const task = this.taskRepo.create({
      taskName: dto.taskName,
      taskDescription: dto.taskDescription,
      startDate: dto.startDate,
      startTime: dto.startTime,
      endDate: dto.endDate,
      endTime: dto.endTime,
      assignedTo,
      assignedBy,
      project: { projectId: dto.projectId },
    });

    return this.taskRepo.save(task);
  }

  async findCalendar(query: GetCalendarDto, userId: string, userRole: string) {
    try {
      const { year, month, employeeId } = query;
      const where: FindOptionsWhere<Task> = {};

      if (userRole === 'employee') {
        where.assignedTo = { user: { id: userId } };
      } else if (userRole === 'admin' && employeeId) {
        where.assignedTo = { id: employeeId };
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
          startDate: 'ASC' as any,
          startTime: 'ASC' as any
        },
      });
    } catch (error) {
      console.error('CALENDAR_FETCH_ERROR:', error);
      throw new InternalServerErrorException(`Could not retrieve calendar data.`);
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

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    Object.assign(task, dto);
    return this.taskRepo.save(task);
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepo.remove(task);
  }

}

