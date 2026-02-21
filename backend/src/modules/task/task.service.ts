import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';

import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { EmployeeProfile } from 'src/modules/employee/entities/employee-profile.entity';
import { TaskStatus } from 'src/shared/enum/task/task-status.enum';
import { TaskActivity } from './entities/task-activity.entity';
import { GetCalendarDto } from './dto/get-calendar.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { TaskChecklist } from './entities/task-checklist.entity';
import { TaskFile } from './entities/task-file.entity';
import { CreateTaskFileDto } from './dto/create-task-file.dto';
import { FileInterceptor, MulterModule } from '@nestjs/platform-express';
import { Project } from '../projects/entities/project.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(EmployeeProfile)
    private readonly employeeRepo: Repository<EmployeeProfile>,
    @InjectRepository(TaskActivity)
    private readonly taskActivityRepo: Repository<TaskActivity>,
    @InjectRepository(TaskChecklist)
    private readonly checklistRepo: Repository<TaskChecklist>,
    @InjectRepository(TaskFile)
    private readonly taskFileRepo: Repository<TaskFile>,
    private readonly dataSource: DataSource,
  ) { }

  private baseTaskQuery() {
    return this.taskRepo
      .createQueryBuilder('task')
      .leftJoin('task.assignedTo', 'assignedTo')
      .leftJoin('task.assignedBy', 'assignedBy')
      .leftJoin('task.project', 'project')
      .select([
        'task.id',
        'task.taskName',
        'task.taskStatus',
        'task.startDate',
        'task.startTime',
        'task.endDate',
        'task.endTime',
        'task.createdAt',
        'task.updatedAt',
        'task.priority',
        'assignedTo.id',
        'assignedTo.name',
        'assignedTo.designation',
        'assignedBy.id',
        'assignedBy.name',
        'project.id',
        'project.projectName',
      ]);
  }

  private async applyCommonFilters(
    qb: SelectQueryBuilder<Task>,
    query: TaskQueryDto,
  ) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    if (search) {
      qb.andWhere(
        `(task.taskName ILIKE :search 
        OR assignedTo.name ILIKE :search
        OR project.projectName ILIKE :search
        OR task.task_status::text ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    const sortMap = {
      createdAt: 'task.createdAt',
      taskName: 'task.taskName',
      startDate: 'task.startDate',
      endDate: 'task.endDate',
      taskStatus: 'task.taskStatus',
    };

    const sortColumn = sortMap[sortBy] || 'task.createdAt';

    qb.orderBy(sortColumn, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(dto: CreateTaskDto, userId: string) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const [assignedTo, assignedBy, project] = await Promise.all([
          manager.findOne(EmployeeProfile, { where: { id: dto.assignedToId } }),
          manager.findOne(EmployeeProfile, { where: { user: { id: userId } } }),
          manager.findOne(Project, { where: { id: dto.projectId } }),
        ]);

        if (!assignedTo) throw new BadRequestException('Invalid assignedTo ID');
        if (!assignedBy) throw new BadRequestException('Invalid assignedBy ID');
        if (!project) throw new BadRequestException('Invalid project ID');

        const task = manager.create(Task, {
          ...dto,
          assignedTo,
          assignedBy,
          project,
        });

        const savedTask = await manager.save(task);

        return {
          id: savedTask.id,
          taskName: savedTask.taskName,
          taskStatus: savedTask.taskStatus,
          createdAt: savedTask.createdAt,
        };
      });
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException(err.message || 'Failed to create task');
    }
  }

  async findAll(query: TaskQueryDto) {
    const qb = this.baseTaskQuery();
    return this.applyCommonFilters(qb, query);
  }

  async findOne(id: string) {
    const task = await this.baseTaskQuery()
      .where('task.id = :id', { id })
      .getRawOne();

    if (!task) throw new NotFoundException('Task not found');

    return task;
  }

  async findCalendar(query: GetCalendarDto, userId: string, userRole: string) {
    const qb = this.baseTaskQuery();

    if (userRole === 'employee') {
      qb.andWhere('assignedTo.id = :userId', { userId });
    } else if (userRole === 'admin' && query.employeeId) {
      qb.andWhere('assignedTo.id = :empId', { empId: query.employeeId });
    }

    if (query.year && query.month) {
      const start = new Date(Number(query.year), Number(query.month) - 1, 1, 0, 0, 0);
      const end = new Date(Number(query.year), Number(query.month), 0, 23, 59, 59);

      qb.andWhere(
        'task.startDate <= :end AND task.endDate >= :start',
        { start, end },
      );
    }

    return qb
      .orderBy('task.startDate', 'ASC')
      .addOrderBy('task.startTime', 'ASC')
      .getRawMany();
  }

  async update(id: string, dto: UpdateTaskDto) {
    const task = await this.taskRepo.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    Object.assign(task, dto);

    const updated = await this.taskRepo.save(task);

    return {
      id: updated.id,
      taskName: updated.taskName,
      taskStatus: updated.taskStatus,
      updatedAt: updated.updatedAt,
    };
  }


  async remove(id: string) {
    const result = await this.taskRepo.delete(id);

    if (!result.affected) {
      throw new NotFoundException('Task not found');
    }
  }

  async changeStatus(
    taskId: string,
    newStatus: TaskStatus,
    changedById: string,
    reason?: string,
  ) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const task = await manager.findOne(Task, { where: { id: taskId } });
        if (!task) throw new NotFoundException('Task not found');
        if (task.taskStatus === newStatus)
          throw new BadRequestException(`Task already in ${newStatus}`);

        const employee = await manager.findOne(EmployeeProfile, {
          where: { id: changedById },
        });
        if (!employee) throw new BadRequestException('Invalid employee');

        const oldStatus = task.taskStatus;
        task.taskStatus = newStatus;

        const activity = manager.create(TaskActivity, {
          task,
          oldStatus,
          newStatus,
          changedBy: employee,
          changeReason: reason,
        });

        await manager.save([task, activity]);

        return {
          taskId: task.id,
          oldStatus,
          newStatus,
          changedAt: activity.changedAt,
          changedBy: { id: employee.id, name: employee.name },
        };
      });
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      )
        throw err;

      throw new InternalServerErrorException(
        err.message || 'Failed to change task status',
      );
    }
  }

  async getTaskActivity(taskId: string) {
    const exists = await this.taskRepo.exist({ where: { id: taskId } });
    if (!exists) throw new NotFoundException('Task not found');

    return this.taskActivityRepo.find({
      where: { task: { id: taskId } },
      relations: { changedBy: true },
      select: {
        id: true,
        oldStatus: true,
        newStatus: true,
        changeReason: true,
        changedAt: true,
        changedBy: { id: true, name: true, designation: true },
      },
      order: { changedAt: 'ASC' },
    });
  }

  async getTasksByProject(projectId: string, query: TaskQueryDto) {
    const qb = this.baseTaskQuery()
      .leftJoin('assignedTo.department', 'department')
      .where('project.projectId = :projectId', { projectId });

    if (query.departmentId) {
      qb.andWhere('department.id = :departmentId', {
        departmentId: query.departmentId,
      });
    }

    return this.applyCommonFilters(qb, query);
  }

  async addChecklist(taskId: string, itemName: string) {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
      relations: [
        'project',
        'assignedTo',
        'assignedTo.department',
      ],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const checklist = this.checklistRepo.create({
      itemName,
      task,
    });

    const savedChecklist = await this.checklistRepo.save(checklist);

    return {
      id: savedChecklist.id,
      itemName: savedChecklist.itemName,
      isCompleted: savedChecklist.isCompleted,
      createdAt: savedChecklist.createdAt,
      updatedAt: savedChecklist.updatedAt,
      task: {
        id: task.id,
        taskName: task.taskName,
        taskStatus: task.taskStatus,
        startDate: task.startDate,
        endDate: task.endDate,
      },
      projectId: task.project?.id,
      departmentId: task.assignedTo?.department?.id,
    };
  }

  async addFile(taskId: string, file: Express.Multer.File, uploadedById: string) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    const uploadedBy = await this.employeeRepo.findOne({ where: { id: uploadedById } });
    if (!uploadedBy) throw new NotFoundException('Uploader not found');

    const taskFile = this.taskFileRepo.create({
      task,
      fileName: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
      fileType: file.mimetype,
      uploadedBy,
    });

    const savedFile = await this.taskFileRepo.save(taskFile);
    return {
      id: savedFile.id,
      fileName: savedFile.fileName,
      fileUrl: savedFile.fileUrl,
      fileType: savedFile.fileType,
      uploadedByName: uploadedBy.name,
      uploadedAt: savedFile.uploadedAt,
    };
  }
}