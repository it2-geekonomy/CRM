import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { EmployeeProfile } from '../employee/entities/employee-profile.entity';
import { ProjectType } from '../project-type/entities/project-type.entity'; 
import { TaskType } from '../task-type/entities/task-type.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Department,
      EmployeeProfile, 
      ProjectType,
      TaskType,
    ]),
  ],
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
