import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeProfile } from './entities/employee-profile.entity';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { User } from '../users/entities/user.entity';
import { Department } from '../department/entities/department.entity';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeeProfile, User, Department]),
    RolesModule,
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService],
})
export class EmployeeModule {}
