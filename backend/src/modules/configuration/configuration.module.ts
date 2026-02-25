import { Module } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { ConfigurationController } from './configuration.controller';
import { DepartmentModule } from '../department/department.module';
import { TaskTypeModule } from '../task-type/task-type.module';

@Module({
  imports: [DepartmentModule, TaskTypeModule],
  providers: [ConfigurationService],
  controllers: [ConfigurationController],
})
export class ConfigurationModule { }