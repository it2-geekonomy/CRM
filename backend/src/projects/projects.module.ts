import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './entities/project.entity';
import { UsersModule } from '../modules/users/users.module';
import { AdminProfile } from 'src/modules/admin/entities/admin-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, AdminProfile])], 
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}