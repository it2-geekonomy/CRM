import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { EmployeeProfile } from '../employee/entities/employee-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Department,
      EmployeeProfile, 
    ]),
  ],
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
