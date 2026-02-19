import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { EmployeeProfile } from '../employee/entities/employee-profile.entity'; // ✅ ADD

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,

    @InjectRepository(EmployeeProfile) 
    private readonly employeeRepository: Repository<EmployeeProfile>,
  ) { }

  async create(dto: CreateDepartmentDto) {
    try {
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

      return await this.departmentRepository.save(department);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create department',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
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
      ...(dto.description !== undefined && {
        description: dto.description ?? null,
      }),
    });

    return this.departmentRepository.save(department);
  }

  async remove(id: string) {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const employeeCount = await this.employeeRepository.count({
      where: { department: { id } },
    });

    if (employeeCount > 0) {
      throw new ConflictException(
        'Cannot delete department. Employees are assigned to it.',
      );
    }

    await this.departmentRepository.delete(id);

    return { message: 'Department deleted successfully' };
  }
}
