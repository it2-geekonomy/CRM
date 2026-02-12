import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminProfile } from './entities/admin-profile.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { ProjectsModule } from 'src/projects/projects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminProfile]),
    UsersModule,
    ProjectsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService, TypeOrmModule],
})
export class AdminModule { }
