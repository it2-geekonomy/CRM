import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminDashboardService } from './admin-dashboard.service';
import { TaskQueryDto } from '../task/dto/task-query.dto';

@ApiTags('admin-dashboard')
@Controller('admin-dashboard')
@ApiBearerAuth('JWT-auth')
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) { }

  @Get('stats')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats returned successfully' })
  getStats() {
    return this.dashboardService.getDashboardStats();
  }

  @Get('tasks')
  async getAllTasks(@Query() query: TaskQueryDto) {
    return this.dashboardService.getAllTasks(query);
  }
}