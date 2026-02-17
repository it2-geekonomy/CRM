import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../../../shared/enum/task/task-status.enum';
import { ApiProperty,ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskStatusDto {
    @ApiProperty({
        enum: TaskStatus,
        example: TaskStatus.IN_PROGRESS,
        description: 'New status of the task',
    })
    @IsEnum(TaskStatus)
    newStatus: TaskStatus;

    @ApiPropertyOptional({
        example: 'Started working on the task',
        description: 'Reason for changing task status',
    })
    @IsOptional()
    @IsString()
    changeReason?: string;
}
