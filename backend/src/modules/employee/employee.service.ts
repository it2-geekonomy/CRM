import { Injectable, NotFoundException, ConflictException,InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { EmployeeProfile } from './entities/employee-profile.entity';
import { User } from '../users/entities/user.entity';
import { Department } from '../department/entities/department.entity';
import { RolesService } from '../roles/roles.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(EmployeeProfile)
    private readonly employeeRepo: Repository<EmployeeProfile>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,

    private readonly rolesService: RolesService,
  ) { }

  async create(dto: CreateEmployeeDto) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const department = await manager.findOne(Department, {
          where: { id: dto.departmentId },
        });
        if (!department) {
          throw new NotFoundException('Department not found');
        }

        const role = await this.rolesService.findByName('employee');
        if (!role) {
          throw new NotFoundException('EMPLOYEE role not found');
        }

        const existingUser = await manager.findOne(User, {
          where: { email: dto.email },
        });
        if (existingUser) {
          throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = manager.create(User, {
          email: dto.email,
          passwordHash: hashedPassword,
          role,
        });
        await manager.save(user);

        const employee = manager.create(EmployeeProfile, {
          user,
          department,
          name: dto.name,
          phone: dto.phone ?? null,
          alternatePhone: dto.alternatePhone ?? null,
          designation: dto.designation,
          employmentType: dto.employmentType,
          employmentStatus: 'ACTIVE',
          dateOfJoining: new Date(dto.dateOfJoining),
          location: dto.location,
          isActive: true,
        });

        return manager.save(employee);
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create employee', {
        cause: error,
      });
    }
  }


  async findAll(query: EmployeeQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const qb = this.employeeRepo
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.user', 'user')
      .leftJoinAndSelect('employee.department', 'department')
      .where('employee.isActive = :isActive', { isActive: true });

    if (search) {
      qb.andWhere(
        '(employee.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const allowedSortFields = [
      'createdAt',
      'name',
      'designation',
      'dateOfJoining',
    ];

    if (allowedSortFields.includes(sortBy)) {
      qb.orderBy(`employee.${sortBy}`, sortOrder);
    } else {
      qb.orderBy('employee.createdAt', 'DESC');
    }

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  findOne(id: string) {
    return this.employeeRepo.findOne({
      where: { id, isActive: true },
      relations: ['user', 'department'],
    });
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    const employee = await this.employeeRepo.findOne({
      where: { id },
      relations: ['department'],
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (dto.departmentId) {
      const department = await this.departmentRepo.findOne({
        where: { id: dto.departmentId },
      });
      if (!department) {
        throw new NotFoundException('Department not found');
      }
      employee.department = department;
    }

    Object.assign(employee, dto);
    return this.employeeRepo.save(employee);
  }

  async remove(id: string) {
    const result = await this.employeeRepo.update(
      { id, isActive: true },
      { isActive: false },
    );

    if (result.affected === 0) {
      throw new NotFoundException('Employee not found or already deleted');
    }

    return { message: 'Employee deactivated successfully' };
  }

}
