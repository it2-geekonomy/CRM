import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Task } from './entities/task.entity';
import { TaskActivity } from './entities/task-activity.entity';
import { EmployeeProfile } from '../employee/entities/employee-profile.entity';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { AuthModule } from '../auth/auth.module';
import { Project } from '../projects/entities/project.entity';
import { TaskChecklist } from './entities/task-checklist.entity';
import { MulterModule } from '@nestjs/platform-express';
import { TaskFile } from './entities/task-file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      TaskActivity,
      TaskChecklist,
      TaskFile,
      EmployeeProfile,
      Project,
    ]),
    AuthModule,
    MulterModule.register({
      dest: './uploads',        
      limits: { fileSize: 25 * 1024 * 1024 }, 
    }),
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule { }
