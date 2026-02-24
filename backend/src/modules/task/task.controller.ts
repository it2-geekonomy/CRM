import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateTaskStatusDto } from './dto/create-task-status.dto';
import { GetCalendarDto } from './dto/get-calendar.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { TaskQueryDto } from './dto/task-query.dto';
import { CreateTaskChecklistDto } from './dto/create-task-checklist.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateTaskFileDto } from './dto/create-task-file.dto';

@ApiTags('Tasks')
@ApiBearerAuth('JWT-auth')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiBody({ type: CreateTaskDto })
  create(@Body() dto: CreateTaskDto, @Req() req: Request) {
    return this.taskService.create(dto, (req as any).user.id);
  }

  @Post(':taskId/checklist')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Add checklist item to task' })
  addChecklist(
    @Param('taskId') taskId: string,
    @Body() dto: CreateTaskChecklistDto,
  ) {
    return this.taskService.addChecklist(taskId, dto);
  }

  @Post(':taskId/files')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Add files related to task' })
  @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload file for a task',
    type: CreateTaskFileDto,
  })
  async addFile(
    @Param('taskId') taskId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.taskService.addFile(taskId, file, (req as any).user.id);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiResponse({ status: 200, description: 'List of all tasks' })
  findAll(@Query() query: TaskQueryDto) {
    return this.taskService.findAll(query);
  }

  @Get('calendar')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get tasks for calendar view' })
  getCalendar(@Query() query: GetCalendarDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.taskService.findCalendar(query, user.sub, user.role);
  }

  @Get('project/:projectId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get tasks by project ID with department filter' })
  @ApiParam({ name: 'projectId', type: 'string', description: 'Project UUID' })
  getTasksByProject(
    @Param('projectId') projectId: string,
    @Query() query: TaskQueryDto,
  ) {
    return this.taskService.getTasksByProject(projectId, query);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Task UUID' })
  @ApiResponse({ status: 200, description: 'Task found' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update task details' })
  @ApiParam({ name: 'id', type: 'string', description: 'Task UUID' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiBody({ type: UpdateTaskDto })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.taskService.update(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Change task status' })
  @ApiParam({ name: 'id', type: 'string', description: 'Task UUID' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiBody({ type: CreateTaskStatusDto })
  changeTaskStatus(
    @Param('id') taskId: string,
    @Body() dto: CreateTaskStatusDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;

    return this.taskService.changeStatus(
      taskId,
      dto.newStatus,
      user.employeeId,
      dto.changeReason,
    );
  }

  @Get(':id/activity')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get task activity log' })
  @ApiParam({ name: 'id', type: 'string', description: 'Task UUID' })
  @ApiResponse({ status: 200, description: 'Activity log retrieved' })
  getActivity(@Param('id') taskId: string) {
    return this.taskService.getTaskActivity(taskId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete task' })
  @ApiParam({ name: 'id', type: 'string', description: 'Task UUID' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async remove(@Param('id') id: string) {
    await this.taskService.remove(id);
    return {
      statusCode: 200,
      message: 'Task deleted successfully',
    };
  }
}