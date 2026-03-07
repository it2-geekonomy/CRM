import { Controller, Get, Req, UseGuards, Query } from '@nestjs/common';
import { EmployeeDashboardService } from './employee-dashboard.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { TaskQueryDto } from '../task/dto/task-query.dto';

@ApiTags('employee-dashboard')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
@Controller('employee-dashboard')
export class EmployeeDashboardController {
    constructor(private readonly dashboardService: EmployeeDashboardService) { }

    @Get('stats')
    @ApiOperation({ summary: 'Get counts for dashboard cards' })
    async getStats(@Req() req) {
        const userId = req.user.sub;
        return this.dashboardService.getStats(userId);
    }

    @Get('tasks')
    @ApiOperation({ summary: 'Get paginated tasks assigned to employee' })
    async getTasks(@Req() req, @Query() query: TaskQueryDto) {
        const userId = req.user.sub;
        return this.dashboardService.getTasksPaginated(userId, query);
    }
}