// src/modules/configuration/configuration.service.ts
import { Injectable } from '@nestjs/common';
import { DepartmentService } from '../department/department.service';
import { TaskTypeService } from '../task-type/task-type.service';
import { ProjectTypeService } from '../project-type/project-type.service';
import { CreateDepartmentDto } from '../department/dto/create-department.dto';
import { CreateTaskTypeDto } from '../task-type/dto/create-task-type.dto';
import { CreateProjectTypeDto } from '../project-type/dto/create-project-type.dto';

@Injectable()
export class ConfigurationService {
  constructor(
    private readonly departmentService: DepartmentService,
    private readonly taskTypeService: TaskTypeService,
    private readonly projectTypeService: ProjectTypeService,
  ) { }


  async createDepartment(dto: CreateDepartmentDto) {
    return await this.departmentService.create(dto);
  }

  async createTaskType(dto: CreateTaskTypeDto) {
    return await this.taskTypeService.create(dto);
  }

  async createProjectType(dto: CreateProjectTypeDto) {
    return await this.projectTypeService.create(dto);
  }
  async getFullConfiguration() {
    const [departments, taskTypes, projectTypes] = await Promise.all([
      this.departmentService.findAll(),
      this.taskTypeService.findAll(),
      this.projectTypeService.findAll(),
    ]);
    return { departments, taskTypes, projectTypes };
  }
}
