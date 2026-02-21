import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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

import { TaskTypeService } from './task-type.service';
import { CreateTaskTypeDto } from './dto/create-task-type.dto';
import { UpdateTaskTypeDto } from './dto/update-task-type.dto';

@ApiTags('Task Types')
@ApiBearerAuth('JWT-auth')
@Controller('task-types')
export class TaskTypeController {
  constructor(private readonly taskTypeService: TaskTypeService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task type' })
  @ApiResponse({ status: 201, description: 'Task type successfully created' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({ status: 409, description: 'Task type name already exists' })
  @ApiBody({ type: CreateTaskTypeDto })
  async create(@Body() createDto: CreateTaskTypeDto) {
    return await this.taskTypeService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all task types' })
  @ApiResponse({ status: 200, description: 'List of task types' })
  async findAll() {
    return await this.taskTypeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task type by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Task Type UUID' })
  async findOne(@Param('id') id: string) {
    return await this.taskTypeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task type' })
  @ApiBody({ type: UpdateTaskTypeDto })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTaskTypeDto,
  ) {
    return await this.taskTypeService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete task type' })
  @ApiParam({ name: 'id', type: 'string', description: 'Task Type UUID' })
  @ApiResponse({ status: 200, description: 'Task type deleted successfully' })
  async remove(@Param('id') id: string) {
    return await this.taskTypeService.remove(id);
  }
}