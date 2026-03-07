import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeDashboardController } from './employee-dashboard.controller';
import { EmployeeDashboardService } from './employee-dashboard.service';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../task/entities/task.entity';
import { EmployeeProfile } from '../employee/entities/employee-profile.entity';
import { AuthModule } from '../auth/auth.module';
@Module({
    imports: [
        TypeOrmModule.forFeature([
            Project,
            Task,
            EmployeeProfile,
        ]),
        AuthModule,
    ],
    controllers: [EmployeeDashboardController],
    providers: [EmployeeDashboardService],
})
export class EmployeeDashboardModule { }