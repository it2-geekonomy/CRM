import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Req,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
    ApiBearerAuth,
} from '@nestjs/swagger';

import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateTaskStatusDto } from './dto/create-task-status.dto';

@ApiTags('Tasks')
@ApiBearerAuth('JWT-auth')
@Controller('tasks')
export class TaskController {
    constructor(private readonly taskService: TaskService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new task' })
    @ApiResponse({ status: 201, description: 'Task created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
    @ApiBody({ type: CreateTaskDto })
    create(@Body() dto: CreateTaskDto, @Req() req) {
        return this.taskService.create(dto, req.user.id);
    }

    @Get()
    @ApiOperation({ summary: 'Get all tasks' })
    @ApiResponse({ status: 200, description: 'List of all tasks' })
    findAll() {
        return this.taskService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get task by ID' })
    @ApiParam({ name: 'id', type: 'string', description: 'Task UUID' })
    @ApiResponse({ status: 200, description: 'Task found' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    findOne(@Param('id') id: string) {
        return this.taskService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update task details' })
    @ApiParam({ name: 'id', type: 'string', description: 'Task UUID' })
    @ApiResponse({ status: 200, description: 'Task updated successfully' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    @ApiBody({ type: UpdateTaskDto })
    update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
        return this.taskService.update(id, dto);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Change task status' })
    @ApiParam({ name: 'id', type: 'string', description: 'Task UUID' })
    @ApiResponse({ status: 200, description: 'Task status updated successfully' })
    @ApiResponse({ status: 400, description: 'Invalid status change' })
    @ApiBody({ type: CreateTaskStatusDto })
    changeTaskStatus(
        @Param('id') taskId: string,
        @Body() dto: CreateTaskStatusDto,
        @Req() req,
    ) {
        return this.taskService.changeStatus(
            taskId,
            dto.newStatus,
            req.user.employeeId,
            dto.changeReason,
        );
    }

    @Get(':id/activity')
    @ApiOperation({ summary: 'Get task activity log' })
    @ApiParam({ name: 'id', type: 'string', description: 'Task UUID' })
    @ApiResponse({ status: 200, description: 'Task activity retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    getActivity(@Param('id') taskId: string) {
        return this.taskService.getTaskActivity(taskId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete task' })
    @ApiParam({ name: 'id', type: 'string', description: 'Task UUID' })
    @ApiResponse({ status: 204, description: 'Task deleted successfully' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    remove(@Param('id') id: string) {
        return this.taskService.remove(id);
    }
}
