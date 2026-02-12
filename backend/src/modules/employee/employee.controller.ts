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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';

@ApiTags('employees')
@ApiBearerAuth('JWT-auth')
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({ status: 201, description: 'Employee successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiBody({ type: CreateEmployeeDto })
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeeService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employees with filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of employees' })
  findAll(@Query() query: EmployeeQueryDto) {
    return this.employeeService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiParam({
    name: 'id',
    type: 'string', 
    description: 'Employee ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Employee found' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update employee details' })
  @ApiParam({
    name: 'id',
    type: 'string', 
    description: 'Employee ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Employee successfully updated' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiBody({ type: UpdateEmployeeDto })
  update(
    @Param('id') id: string, 
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate employee' })
  @ApiParam({
    name: 'id',
    type: 'string', 
    description: 'Employee ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Employee deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  remove(@Param('id') id: string) { 
    return this.employeeService.remove(id);
  }
}