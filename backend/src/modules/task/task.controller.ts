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
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
    ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request } from 'express';


import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@ApiTags('tasks')
@ApiBearerAuth('JWT-auth')
@Controller('tasks')
export class TaskController {
    constructor(private readonly taskService: TaskService) { }

    // ================= CREATE TASK =================
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new task' })
    @ApiResponse({ status: 201, description: 'Task successfully created' })
    @ApiResponse({ status: 400, description: 'Bad request / validation failed' })
    @ApiBody({ type: CreateTaskDto })
    create(
        @Body() dto: CreateTaskDto,
        @Req() req: Request,
    ) {
        // JWT payload injected by AuthGuard
        const user = req.user as { id: string };

        return this.taskService.create(dto, user.id);
    }

    // ================= GET ALL TASKS =================
    @Get()
    @ApiOperation({ summary: 'Get all tasks' })
    @ApiResponse({ status: 200, description: 'List of tasks' })
    findAll() {
        return this.taskService.findAll();
    }

    // ================= GET TASK BY ID =================
    @Get(':id')
    @ApiOperation({ summary: 'Get task by ID' })
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'Task ID (UUID)',
    })
    @ApiResponse({ status: 200, description: 'Task found' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    findOne(@Param('id') id: string) {
        return this.taskService.findOne(id);
    }

    // ================= UPDATE TASK =================
    @Patch(':id')
    @ApiOperation({ summary: 'Update task details' })
    @ApiResponse({ status: 200, description: 'Task successfully updated' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    @ApiBody({ type: UpdateTaskDto })
    update(
        @Param('id') id: string,
        @Body() dto: UpdateTaskDto,
    ) {
        return this.taskService.update(id, dto);
    }

    // ================= DELETE TASK =================
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete task' })
    @ApiResponse({ status: 200, description: 'Task deleted successfully' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    remove(@Param('id') id: string) {
        return this.taskService.remove(id);
    }
}
