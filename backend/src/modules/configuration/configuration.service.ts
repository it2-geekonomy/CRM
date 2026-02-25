// src/modules/configuration/configuration.service.ts
import { Injectable } from '@nestjs/common';
import { DepartmentService } from '../department/department.service';
import { TaskTypeService } from '../task-type/task-type.service';
import { CreateDepartmentDto } from '../department/dto/create-department.dto';
import { CreateTaskTypeDto } from '../task-type/dto/create-task-type.dto';

@Injectable()
export class ConfigurationService {
  constructor(
    private readonly departmentService: DepartmentService,
    private readonly taskTypeService: TaskTypeService,
  ) {}


  async createDepartment(dto: CreateDepartmentDto) {
    return await this.departmentService.create(dto);
  }

  async createTaskType(dto: CreateTaskTypeDto) {
    return await this.taskTypeService.create(dto);
  }

  async getFullConfiguration() {
    const [departments, taskTypes] = await Promise.all([
      this.departmentService.findAll(),
      this.taskTypeService.findAll(),
    ]);
    return { departments, taskTypes };
  }
}