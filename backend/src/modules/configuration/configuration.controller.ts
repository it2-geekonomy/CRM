import {
    Controller,
    Get,
    Post,
    Body,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiBearerAuth
} from '@nestjs/swagger';
import { ConfigurationService } from './configuration.service';
import { CreateDepartmentDto } from '../department/dto/create-department.dto';
import { CreateTaskTypeDto } from '../task-type/dto/create-task-type.dto';
import { CreateProjectTypeDto } from '../project-type/dto/create-project-type.dto';

@ApiTags('Configuration')
@ApiBearerAuth('JWT-auth')
@Controller('configuration')
export class ConfigurationController {
    constructor(private readonly configService: ConfigurationService) { }

    @Get('summary')
    @ApiOperation({ summary: 'Get all setup data (Departments, Task Types & Project Types)' })
    @ApiResponse({ status: 200, description: 'Summary retrieved successfully' })
    async getSummary() {
        return await this.configService.getFullConfiguration();
    }

    @Post('department')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new department' })
    @ApiResponse({ status: 201, description: 'Department created' })
    @ApiBody({ type: CreateDepartmentDto })
    async createDept(@Body() dto: CreateDepartmentDto) {
        return await this.configService.createDepartment(dto);
    }

    @Post('task-type')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new task type' })
    @ApiResponse({ status: 201, description: 'Task type created' })
    @ApiBody({ type: CreateTaskTypeDto })
    async createType(@Body() dto: CreateTaskTypeDto) {
        return await this.configService.createTaskType(dto);
    }

    @Post('project-type')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new project type' })
    @ApiResponse({ status: 201, description: 'Project type created successfully' })
    @ApiBody({ type: CreateProjectTypeDto })
    async createProjectType(@Body() dto: CreateProjectTypeDto) {
        return await this.configService.createProjectType(dto);
    }


}
