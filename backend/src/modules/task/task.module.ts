import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Task } from './entities/task.entity';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { EmployeeProfile } from 'src/modules/employee/entities/employee-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      EmployeeProfile, 
    ]),
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
