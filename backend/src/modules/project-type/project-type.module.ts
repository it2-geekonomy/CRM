import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectTypeService } from './project-type.service';
import { ProjectTypeController } from './project-type.controller';
import { ProjectType } from './entities/project-type.entity';
import { Department } from '../department/entities/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectType, Department])],
  controllers: [ProjectTypeController],
  providers: [ProjectTypeService],
  exports: [ProjectTypeService],
})
export class ProjectTypeModule { }