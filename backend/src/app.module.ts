import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { RolesModule } from './modules/roles/roles.module';
import { DepartmentModule } from './modules/department/department.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { TaskModule } from './modules/task/task.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TaskTypeModule } from './modules/task-type/task-type.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    UsersModule,
    AuthModule,
    AdminModule,
    RolesModule,
    DepartmentModule,
    ProjectsModule,
    EmployeeModule,
    TaskModule,
    TaskTypeModule,

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }