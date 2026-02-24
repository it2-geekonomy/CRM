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
import { AdminService } from './admin.service';
import { CreateAdminProfileDto } from './dto/create-admin-profile.dto';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';

@ApiTags('admin')
@Controller('admin')
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an admin profile' })
  @ApiResponse({ status: 201, description: 'Admin profile created' })
  @ApiResponse({ status: 400, description: 'User must have role admin' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Admin profile already exists for this user' })
  @ApiBody({ type: CreateAdminProfileDto })
  create(@Body() dto: CreateAdminProfileDto) {
    return this.adminService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all admin profiles' })
  @ApiResponse({ status: 200, description: 'List of admin profiles' })
  findAll() {
    return this.adminService.findAll();
  }

  @Get('by-user/:userId')
  @ApiOperation({ summary: 'Get admin profile by user ID' })
  @ApiParam({ name: 'userId', type: 'string', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'Admin profile' })
  findByUserId(@Param('userId') userId: string) {
    return this.adminService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get admin profile by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Admin profile UUID' })
  @ApiResponse({ status: 200, description: 'Admin profile' })
  @ApiResponse({ status: 404, description: 'Admin profile not found' })
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an admin profile' })
  @ApiParam({ name: 'id', type: 'string', description: 'Admin profile UUID' })
  @ApiResponse({ status: 200, description: 'Admin profile updated' })
  @ApiResponse({ status: 404, description: 'Admin profile not found' })
  @ApiBody({ type: UpdateAdminProfileDto })
  update(@Param('id') id: string, @Body() dto: UpdateAdminProfileDto) {
    return this.adminService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an admin profile' })
  @ApiParam({ name: 'id', type: 'string', description: 'Admin profile UUID' })
  @ApiResponse({ status: 204, description: 'Admin profile deleted' })
  @ApiResponse({ status: 404, description: 'Admin profile not found' })
  remove(@Param('id') id: string) {
    return this.adminService.remove(id);
  }
}
