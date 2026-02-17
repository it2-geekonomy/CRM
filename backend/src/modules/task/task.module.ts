import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Task } from './entities/task.entity';
import { TaskActivity } from './entities/task-activity.entity';
import { EmployeeProfile } from '../employee/entities/employee-profile.entity';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      TaskActivity, 
      EmployeeProfile,
    ]),
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule { }
