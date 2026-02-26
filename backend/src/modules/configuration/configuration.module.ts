import { Module } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { ConfigurationController } from './configuration.controller';
import { DepartmentModule } from '../department/department.module';
import { TaskTypeModule } from '../task-type/task-type.module';
import { ProjectTypeModule } from '../project-type/project-type.module';

@Module({
  imports: [DepartmentModule, TaskTypeModule, ProjectTypeModule],
  providers: [ConfigurationService],
  controllers: [ConfigurationController],
})
export class ConfigurationModule { }