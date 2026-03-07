import { Controller, Get, Req, UseGuards, Query } from '@nestjs/common';
import { EmployeeDashboardService } from './employee-dashboard.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';

@ApiTags('employee-dashboard')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
@Controller('employee-dashboard')
export class EmployeeDashboardController {
    constructor(private readonly dashboardService: EmployeeDashboardService) { }

    @Get('stats')
    @ApiOperation({ summary: 'Get counts for the four dashboard cards' })
    async getStats(@Req() req) {
        const userId = req.user.sub;
        return this.dashboardService.getStats(userId);
    }

    @Get('tasks')
    @ApiOperation({ summary: 'Get paginated tasks' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    async getTasks(
        @Req() req,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
    ) {
        const userId = req.user.sub;
        return this.dashboardService.getTasksPaginated(userId, page, limit, search);
    }
}

