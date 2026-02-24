import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';
import { TaskPriority } from '../../../shared/enum/task/task-priority.enum';

export class UpdateTaskDto {

    @ApiPropertyOptional({
        example: 'Follow up with client',
    })
    @IsOptional()
    @IsString()
    name?: string; 

    @ApiPropertyOptional({
        example: 'Call client regarding payment',
    })
    @IsOptional()
    @IsString()
    description?: string; 

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

    @ApiPropertyOptional({
        example: 'e492a68f-4f1e-4b1e-8e0d-5f82cb25f6c3',
    })
    @IsOptional()
    @IsUUID()
    projectId?: string;

    @ApiPropertyOptional({
        enum: TaskPriority,
        example: TaskPriority.HIGH,
        description: 'Priority of the task',
    })
    @IsOptional()
    @IsEnum(TaskPriority)
    priority?: TaskPriority;

    @ApiPropertyOptional({
        example: 'f3b2c6a1-4d2e-4c92-9f21-7f7a8e4c1a22',
        description: 'UUID of the task type',
    })
    @IsOptional()
    @IsUUID()
    taskTypeId?: string;
}