import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { EmployeeDashboardService } from './employee-dashboard.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
}