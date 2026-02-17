import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';

export class UpdateTaskDto {
    @ApiPropertyOptional({
        example: 'Follow up with client',
    })
    @IsOptional()
    @IsString()
    taskName?: string;

    @ApiPropertyOptional({
        example: 'Call client regarding payment',
    })
    @IsOptional()
    @IsString()
    taskDescription?: string;

    @ApiPropertyOptional({
        example: '2026-02-14',
    })
    @IsOptional()
    @IsString()
    startDate?: string;

    @ApiPropertyOptional({
        example: '10:00',
    })
    @IsOptional()
    @IsString()
    startTime?: string;

    @ApiPropertyOptional({
        example: '2026-02-14',
    })
    @IsOptional()
    @IsString()
    endDate?: string;

    @ApiPropertyOptional({
        example: '11:00',
    })
    @IsOptional()
    @IsString()
    endTime?: string;

    @ApiPropertyOptional({
        example: '7cf80ce3-acb8-4fc1-8584-3c0208400cdc',
    })
    @IsOptional()
    @IsUUID()
    assignedToId?: string;
}
