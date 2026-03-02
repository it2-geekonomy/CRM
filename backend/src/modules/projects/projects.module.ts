import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';

import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';

import { Project } from './entities/project.entity';
import { ProjectDocument } from './entities/project-document.entity';
import { AdminProfile } from 'src/modules/admin/entities/admin-profile.entity';
import { Client } from '../client/entities/client.entity';
import { EmployeeProfile } from '../employee/entities/employee-profile.entity';
import { ProjectType } from '../project-type/entities/project-type.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      ProjectDocument,
      AdminProfile,
      Client,
      EmployeeProfile,
      ProjectType,
    ]),

    MulterModule.register({
       dest: './uploads/projects',
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}