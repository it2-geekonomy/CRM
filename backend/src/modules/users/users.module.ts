import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { RolesModule } from '../roles/roles.module';
import { EmployeeProfile } from '../employee/entities/employee-profile.entity';
import { AdminProfile } from '../admin/entities/admin-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, EmployeeProfile, AdminProfile]),
    RolesModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule { }