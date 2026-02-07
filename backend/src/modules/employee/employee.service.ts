import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { EmployeeProfile } from './entities/employee-profile.entity';
import { User } from '../users/entities/user.entity';
import { Department } from '../department/entities/department.entity';
import { RolesService } from '../roles/roles.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

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
    return this.dataSource.transaction(async manager => {
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
  }

  findAll() {
    return this.employeeRepo.find({
      where: { isActive: true },
      relations: ['user', 'department'],
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: number) {
    return this.employeeRepo.findOne({
      where: { id, isActive: true },
      relations: ['user', 'department'],
    });
  }

  async update(id: number, dto: UpdateEmployeeDto) {
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

  async remove(id: number) {
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
