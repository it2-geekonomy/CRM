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

import { ProjectTypeService } from './project-type.service';
import { CreateProjectTypeDto } from './dto/create-project-type.dto';
import { UpdateProjectTypeDto } from './dto/update-project-type.dto';

@ApiTags('Project Types')
@ApiBearerAuth('JWT-auth')
@Controller('project-types')
export class ProjectTypeController {
  constructor(private readonly projectTypeService: ProjectTypeService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new project type' })
  @ApiResponse({ status: 201, description: 'Project type successfully created' })
  @ApiResponse({ status: 409, description: 'Project type name already exists' })
  @ApiBody({ type: CreateProjectTypeDto })
  async create(@Body() createDto: CreateProjectTypeDto) {
    return await this.projectTypeService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all project types' })
  @ApiResponse({ status: 200, description: 'List of project types' })
  async findAll() {
    return await this.projectTypeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project type by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Project Type UUID' })
  async findOne(@Param('id') id: string) {
    return await this.projectTypeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project type' })
  @ApiBody({ type: UpdateProjectTypeDto })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProjectTypeDto,
  ) {
    return await this.projectTypeService.update(id, updateDto);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted project type' })
  @ApiParam({ name: 'id', type: 'string', description: 'Project Type UUID' })
  @ApiResponse({ status: 200, description: 'Project type restored successfully' })
  async restore(@Param('id') id: string) {
    return await this.projectTypeService.restore(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete project type' })
  @ApiParam({ name: 'id', type: 'string', description: 'Project Type UUID' })
  @ApiResponse({ status: 200, description: 'Project type deleted successfully' })
  async remove(@Param('id') id: string) {
    return await this.projectTypeService.remove(id);
  }
}