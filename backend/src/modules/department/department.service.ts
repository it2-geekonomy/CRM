import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async create(dto: CreateDepartmentDto) {
    if (dto.code) {
      const existingByCode = await this.departmentRepository.findOne({
        where: { code: dto.code },
      });
      if (existingByCode) {
        throw new ConflictException(
          `Department with code "${dto.code}" already exists`,
        );
      }
    }
    const department = this.departmentRepository.create({
      name: dto.name,
      code: dto.code ?? null,
      description: dto.description ?? null,
    });
    return this.departmentRepository.save(department);
  }

  async findAll() {
    return this.departmentRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string) {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });
    if (!department) {
      throw new HttpException('Department not found', HttpStatus.NOT_FOUND);
    }
    return department;
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });
    if (!department) {
      throw new HttpException('Department not found', HttpStatus.NOT_FOUND);
    }
    if (dto.code !== undefined) {
      const existingByCode = await this.departmentRepository.findOne({
        where: { code: dto.code },
      });
      if (existingByCode && existingByCode.id !== id) {
        throw new ConflictException(
          `Department with code "${dto.code}" already exists`,
        );
      }
    }
    Object.assign(department, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.code !== undefined && { code: dto.code ?? null }),
      ...(dto.description !== undefined && { description: dto.description ?? null }),
    });
    return this.departmentRepository.save(department);
  }

  async remove(id: string) {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });
    if (!department) {
      throw new HttpException('Department not found', HttpStatus.NOT_FOUND);
    }
    await this.departmentRepository.remove(department);
  }
}
