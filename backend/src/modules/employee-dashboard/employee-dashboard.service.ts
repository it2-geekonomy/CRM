import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';

import { Project } from '../projects/entities/project.entity';
import { Task } from '../task/entities/task.entity';
import { EmployeeProfile } from '../employee/entities/employee-profile.entity';
import { TaskActivity } from '../task/entities/task-activity.entity';

import { TaskStatus } from 'src/shared/enum/task/task-status.enum';
import { ProjectStatus } from 'src/shared/enum/project/project-status.enum';

@Injectable()
export class EmployeeDashboardService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,

    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,

    @InjectRepository(EmployeeProfile)
    private readonly employeeRepo: Repository<EmployeeProfile>,

    @InjectRepository(TaskActivity)
    private readonly taskActivityRepo: Repository<TaskActivity>,
  ) { }

  async getStats(userId: string) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const employee = await this.employeeRepo.findOne({
      where: { user: { id: userId }, isActive: true },
      relations: ['department'],
    });

    if (!employee) throw new NotFoundException('Employee not found');

    const activeProjectsCount = await this.projectRepo.count({
      where: { status: ProjectStatus.ACTIVE },
    });

    const tasksThisWeek = await this.taskRepo.find({
      where: { createdAt: MoreThanOrEqual(startOfWeek) },
    });

    const completedTasksCount = await this.taskRepo.count({
      where: { status: TaskStatus.ADDRESSED },
    });

    let totalHours = 0;
    tasksThisWeek.forEach((task) => {
      if (task.startDate && task.startTime && task.endDate && task.endTime) {
        const start = new Date(`${task.startDate}T${task.startTime}`);
        const end = new Date(`${task.endDate}T${task.endTime}`);
        const diffMs = end.getTime() - start.getTime();
        if (diffMs > 0) totalHours += diffMs / (1000 * 60 * 60); 
      }
    });

    const teamMembers = await this.employeeRepo.count({
      where: { isActive: true },
    });

    return {
      activeProjects: {
        value: activeProjectsCount,
        delta: '↑ 3 from last week',
      },
      tasksThisWeek: {
        value: tasksThisWeek.length,
        delta: `↑ ${completedTasksCount} completed`,
      },
      hoursLogged: {
        value: `${totalHours.toFixed(1)}h`,
        delta: '↑ 4h from last week',
      },
      teamMembers: {
        value: teamMembers,
        delta: 'No change',
      },
    };
  }
}