import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { EmployeeProfile } from 'src/modules/employee/entities/employee-profile.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,

    @InjectRepository(EmployeeProfile)
    private readonly employeeRepo: Repository<EmployeeProfile>,
  ) {}

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
    });

    return this.taskRepo.save(task);
  }

  async findAll(): Promise<Task[]> {
    return this.taskRepo.find({
      relations: ['assignedTo', 'assignedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['assignedTo', 'assignedBy'],
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
