import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder, Not, Between } from 'typeorm';

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
import { TaskPriority } from 'src/shared/enum/task/task-priority.enum';
import { CreateTaskChecklistDto } from './dto/create-task-checklist.dto';
import { Project } from 'src/modules/projects/entities/project.entity';
import { TaskType } from 'src/modules/task-type/entities/task-type.entity';
import { TaskChecklistTimestamp } from './entities/task-checklist-timestamp.entity';
import { CreateChecklistTimestampDto } from './dto/create-checklist-timestamp.dto';

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
    @InjectRepository(TaskChecklistTimestamp)
    private timestampRepo: Repository<TaskChecklistTimestamp>,
    private readonly dataSource: DataSource,
  ) { }

  private baseTaskQuery() {
    return this.taskRepo
      .createQueryBuilder('task')
      .leftJoin('task.assignedTo', 'assignedTo')
      .leftJoin('task.assignedBy', 'assignedBy')
      .leftJoin('task.project', 'project')
      .leftJoin('task.taskType', 'taskType')
      .leftJoin('taskType.department', 'department')
      .leftJoin('task.checklists', 'checklists')
      .select([
        'task.id',
        'task.name',
        'task.description',
        'task.status',
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
        'project.name',
        'taskType.id',
        'taskType.name',
        'department.id',
        'department.name',
        'checklists.id',
        'checklists.itemName',
        'checklists.isCompleted',
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
        `(task.name ILIKE :search 
        OR assignedTo.name ILIKE :search
        OR project.name ILIKE :search
        OR task.status::text ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    if (query.date) {
      qb.andWhere(
        ':clickedDate BETWEEN task.startDate AND task.endDate',
        { clickedDate: query.date }
      );
    }

    if (query.departmentId) {
      qb.andWhere('department.id = :departmentId', {
        departmentId: query.departmentId,
      });
    }

    if (query.priority) {
      qb.andWhere('task.priority = :priority', {
        priority: query.priority,
      });
    }

    if (query.taskTypeId) {
      qb.andWhere('taskType.id = :taskTypeId', {
        taskTypeId: query.taskTypeId,
      });
    }

    if (query.projectId) {
      qb.andWhere('project.id = :projectId', {
        projectId: query.projectId,
      });
    }

    const sortMap = {
      createdAt: 'task.createdAt',
      name: 'task.name',
      startDate: 'task.startDate',
      endDate: 'task.endDate',
      status: 'task.status',
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
        const [assignedTo, assignedBy, project, taskType] =
          await Promise.all([
            manager.findOne(EmployeeProfile, {
              where: { id: dto.assignedToId },
            }),
            manager.findOne(EmployeeProfile, {
              where: { user: { id: userId } },
            }),
            manager.findOne(Project, { where: { id: dto.projectId } }),
            manager.findOne(TaskType, { where: { id: dto.taskTypeId } }),
          ]);

        if (!assignedTo) throw new BadRequestException('Invalid assignedTo ID');
        if (!assignedBy) throw new BadRequestException('Invalid assignedBy ID');
        if (!project) throw new BadRequestException('Invalid project ID');
        if (!taskType) throw new BadRequestException('Invalid task type ID');

        const task = manager.create(Task, {
          name: dto.name,
          description: dto.description,
          startDate: dto.startDate,
          startTime: dto.startTime,
          endDate: dto.endDate,
          endTime: dto.endTime,
          status: TaskStatus.IN_PROGRESS,
          priority: dto.priority || TaskPriority.MEDIUM,
          assignedTo,
          assignedBy,
          project,
          taskType,
        });

        const savedTask = await manager.save(task);

        return {
          id: savedTask.id,
          taskName: savedTask.name,
          taskStatus: savedTask.status,
          createdAt: savedTask.createdAt,
        };
      });
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException(
        err.message || 'Failed to create task',
      );

    }
  }

  async findAll(query: TaskQueryDto) {
    const qb = this.baseTaskQuery();
    return this.applyCommonFilters(qb, query);
  }

  async findOne(id: string) {
    const task = await this.baseTaskQuery()
      .where('task.id = :id', { id })
      .getOne();

    if (!task) throw new NotFoundException('Task not found');

    const total = task.checklists?.length || 0;
    const completed = task.checklists?.filter(c => c.isCompleted).length || 0;

    return {
      task,

    };
  }

  async findCalendar(query: GetCalendarDto, userId: string, userRole: string) {
    const qb = this.baseTaskQuery();

    if (userRole === 'employee') {
      qb.andWhere('assignedTo.id = :userId', { userId });
    } else if (userRole === 'admin' && query.employeeId) {
      qb.andWhere('assignedTo.id = :empId', { empId: query.employeeId });
    }

    if (query.year && query.month) {
      const start = new Date(Number(query.year), Number(query.month) - 1, 1);
      const end = new Date(Number(query.year), Number(query.month), 0);
      qb.andWhere('task.startDate <= :end AND task.endDate >= :start', {
        start,
        end,
      });
    }

    return qb
      .orderBy('task.startDate', 'ASC')
      .addOrderBy('task.startTime', 'ASC')
      .getMany();
  }

  async getTasksByAssignee(assignedToId: string, query: TaskQueryDto) {
    const qb = this.baseTaskQuery()
      .where('assignedTo.id = :assignedToId', { assignedToId });

    return this.applyCommonFilters(qb, query);
  }

  async getTasksByProject(projectId: string, query: TaskQueryDto) {
    const qb = this.baseTaskQuery()
      .where('project.id = :projectId', { projectId });

    return this.applyCommonFilters(qb, query);
  }

  async update(id: string, dto: UpdateTaskDto) {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');

    Object.assign(task, dto);
    const updated = await this.taskRepo.save(task);

    return {
      id: updated.id,
      taskName: updated.name,
      taskStatus: updated.status,
      updatedAt: updated.updatedAt,
    };
  }

  async remove(id: string) {
    const result = await this.taskRepo.delete(id);
    if (!result.affected) throw new NotFoundException('Task not found');
  }

  async changeStatus(
    taskId: string,
    newStatus: TaskStatus,
    changedById: string,
    reason?: string,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const task = await manager.findOne(Task, { where: { id: taskId } });
      if (!task) throw new NotFoundException('Task not found');
      if (task.status === newStatus)
        throw new BadRequestException(`Task already in ${newStatus}`);

      const employee = await manager.findOne(EmployeeProfile, {
        where: { id: changedById },
      });
      if (!employee) throw new BadRequestException('Invalid employee');

      const oldStatus = task.status;
      task.status = newStatus;

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

  async addChecklist(taskId: string, dto: CreateTaskChecklistDto) {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
      relations: ['project', 'assignedTo', 'assignedTo.department'],
    });

    if (!task) throw new NotFoundException(`Cannot add checklist item: Task not found`);

    const checklist = this.checklistRepo.create({
      itemName: dto.itemName,
      task,
    });

    const savedChecklist = await this.checklistRepo.save(checklist);

    return {
      message: 'Checklist item added successfully',
      data: {
        id: savedChecklist.id,
        item_name: savedChecklist.itemName,
        is_completed: savedChecklist.isCompleted,
        created_at: savedChecklist.createdAt,
        updated_at: savedChecklist.updatedAt,
        task: {
          id: task.id,
          task_name: task.name,
          task_status: task.status,
          start_date: task.startDate,
          end_date: task.endDate,
        },
        project_id: task.project?.id,
        department_id: task.assignedTo?.department?.id,
      }
    };
  }

  async findAllChecklist(taskId: string) {
    const taskExists = await this.taskRepo.exist({ where: { id: taskId } });
    if (!taskExists) throw new NotFoundException(`Task not found`);

    return this.checklistRepo.find({
      where: { task: { id: taskId } },
      order: { createdAt: 'ASC' },
    });
  }

  async findOneChecklist(id: string) {
    const item = await this.checklistRepo.findOne({
      where: { id },
      relations: ['task'],
    });

    if (!item) throw new NotFoundException(`Checklist item not found`);

    return {
      id: item.id,
      itemName: item.itemName,
      isCompleted: item.isCompleted,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      taskId: item.task.id,
    };
  }

  async updateChecklist(id: string, dto: { itemName?: string; isCompleted?: boolean }) {
    const item = await this.checklistRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Checklist item not found`);
    if (dto.itemName !== undefined) item.itemName = dto.itemName;
    if (dto.isCompleted !== undefined) item.isCompleted = dto.isCompleted;

    const saved = await this.checklistRepo.save(item);
    return {
      message: 'Checklist item updated successfully',
      data: saved,
    };
  }

  async removeChecklist(id: string) {
    const result = await this.checklistRepo.delete(id);
    if (!result.affected) throw new NotFoundException(`Checklist not found`);
    return {
      statusCode: 200,
      message: 'Checklist item deleted successfully'
    };
  }

  async addFile(taskId: string, file: Express.Multer.File, uploadedById: string) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException(`Cannot upload file: Task  not found`);

    const uploadedBy = await this.employeeRepo.findOne({ where: { id: uploadedById } });
    if (!uploadedBy) throw new NotFoundException(`Uploader  not found`);

    const taskFile = this.taskFileRepo.create({
      task,
      name: file.originalname,
      url: `/uploads/tasks/${file.filename}`,
      type: file.mimetype,
      uploadedBy,
    });

    const savedFile = await this.taskFileRepo.save(taskFile);

    return {
      message: 'File uploaded successfully',
      data: {
        id: savedFile.id,
        fileName: savedFile.name,
        fileUrl: savedFile.url,
        fileType: savedFile.type,
        uploadedByName: uploadedBy.name,
        uploadedAt: savedFile.uploadedAt,
      }
    };
  }

  async findAllFiles(taskId: string) {
    const taskExists = await this.taskRepo.exist({ where: { id: taskId } });
    if (!taskExists) throw new NotFoundException(`Task not found`);

    return this.taskFileRepo.find({
      where: { task: { id: taskId } },
      relations: ['uploadedBy'],
      order: { uploadedAt: 'DESC' },
    });
  }

  async findOneFile(id: string) {
    const file = await this.taskFileRepo.findOne({
      where: { id },
      relations: ['task', 'uploadedBy'],
    });

    if (!file) throw new NotFoundException(`File not found`);

    return {
      id: file.id,
      name: file.name,
      url: file.url,
      type: file.type,
      uploadedAt: file.uploadedAt,
      taskId: file.task?.id,
      uploadedBy: {
        id: file.uploadedBy?.id,
        name: file.uploadedBy?.name,
      },
    };
  }

  async updateFile(id: string, name: string) {
    if (!name) {
      throw new BadRequestException('File name is required');
    }

    const file = await this.taskFileRepo.findOne({ where: { id } });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    file.name = name;

    const saved = await this.taskFileRepo.save(file);

    return {
      message: 'File renamed successfully',
      data: {
        id: saved.id,
        newName: saved.name,
        url: saved.url,
      },
    };
  }

  async removeFile(id: string) {
    const result = await this.taskFileRepo.delete(id);
    if (!result.affected) throw new NotFoundException(`File not found`);
    return {
      statusCode: 200,
      message: 'File deleted successfully'
    };
  }

  // async getPendingTasksForWeek() {
  //   const today = new Date().toISOString().split('T')[0];
  //   const nextWeek = new Date();
  //   nextWeek.setDate(nextWeek.getDate() + 7);
  //   const endOfWeek = nextWeek.toISOString().split('T')[0];

  //   return await this.taskRepo.find({
  //     where: {
  //       status: Not(TaskStatus.ADDRESSED),
  //       endDate: Between(today, endOfWeek),
  //     },
  //     order: { endDate: 'ASC' },
  //   });
  // }
  async getPendingTasksForWeek(): Promise<number> {
    const today = new Date();
    const endOfWeek = new Date();
    endOfWeek.setDate(today.getDate() + 7);

    const startStr = today.toISOString().split('T')[0];
    const endStr = endOfWeek.toISOString().split('T')[0];

    return await this.taskRepo.count({
      where: {
        status: Not(TaskStatus.ADDRESSED),
        endDate: Between(startStr, endStr),
      },
    });
  }

  async addChecklistTimestamp(dto: CreateChecklistTimestampDto) {
    const checklist = await this.checklistRepo.findOne({
      where: { id: dto.checklistId },
    });

    if (!checklist) {
      throw new Error('Checklist item not found');
    }

    const timestamp = this.timestampRepo.create({
      date: dto.date,
      hours: dto.hours,
      minutes: dto.minutes,
      notes: dto.notes,
      checklist: checklist,
    });

    return await this.timestampRepo.save(timestamp);
  }
}