import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TaskType } from './entities/task-type.entity';
import { Department } from '../department/entities/department.entity';
import { CreateTaskTypeDto } from './dto/create-task-type.dto';
import { UpdateTaskTypeDto } from './dto/update-task-type.dto';

@Injectable()
export class TaskTypeService {
  constructor(
    @InjectRepository(TaskType)
    private readonly taskTypeRepository: Repository<TaskType>,

    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) { }

  async create(createDto: CreateTaskTypeDto) {
    try {
      const { name, description, departmentId } = createDto;

      const department = await this.departmentRepository.findOne({
        where: { id: departmentId },
      });

      if (!department)
        throw new NotFoundException('Department not found');

      const existing = await this.taskTypeRepository.findOne({
        where: { name },
      });

      if (existing)
        throw new ConflictException('Task type name already exists');

      const taskType = this.taskTypeRepository.create({
        name,
        description,
        department,
      });

      return await this.taskTypeRepository.save(taskType);
    } catch (err) {
      if (
        err instanceof ConflictException ||
        err instanceof NotFoundException
      ) {
        throw err;
      }

      throw new InternalServerErrorException(
        err.message || 'Failed to create task type',
      );
    }
  }

  async findAll() {
    try {
      return await this.taskTypeRepository.find({
        relations: ['department'],
        order: { createdAt: 'DESC' },
      });
    } catch (err) {
      throw new InternalServerErrorException(
        err.message || 'Failed to fetch task types',
      );
    }
  }

  async findOne(id: string) {
    try {
      const taskType = await this.taskTypeRepository.findOne({
        where: { id },
        relations: ['department'],
      });

      if (!taskType)
        throw new NotFoundException(`Task type with ID ${id} not found`);

      return taskType;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;

      throw new InternalServerErrorException(
        err.message || 'Failed to fetch task type',
      );
    }
  }

  async update(id: string, updateDto: UpdateTaskTypeDto) {
    try {
      const taskType = await this.findOne(id);

      if (updateDto.departmentId) {
        const department = await this.departmentRepository.findOne({
          where: { id: updateDto.departmentId },
        });

        if (!department)
          throw new NotFoundException('Department not found');

        taskType.department = department;
      }

      if (updateDto.name) {
        const existing = await this.taskTypeRepository.findOne({
          where: { name: updateDto.name },
        });

        if (existing && existing.id !== id)
          throw new ConflictException('Task type name already exists');
      }

      Object.assign(taskType, updateDto);

      return await this.taskTypeRepository.save(taskType);
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof ConflictException
      ) {
        throw err;
      }

      throw new InternalServerErrorException(
        err.message || 'Failed to update task type',
      );
    }
  }

  async remove(id: string) {
    try {
      const taskType = await this.findOne(id);

      await this.taskTypeRepository.remove(taskType);

      return { message: 'Task type deleted successfully' };
    } catch (err) {
      throw new InternalServerErrorException(
        err.message || 'Failed to delete task type',
      );
    }
  }
}