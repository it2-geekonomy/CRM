import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './entities/project.entity';
import { AdminProfile } from 'src/modules/admin/entities/admin-profile.entity';
import { ProjectDocument } from './entities/project-document.entity';
import { Client } from '../client/entities/client.entity';
import { EmployeeProfile } from '../employee/entities/employee-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, AdminProfile, ProjectDocument, Client, EmployeeProfile])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule { }