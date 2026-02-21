import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '../../../shared/enum/task/task-status.enum';
import { TaskPriority } from '../../../shared/enum/task/task-priority.enum';

export class CreateTaskDto {

  @ApiProperty({
    example: 'Complete Project Documentation',
    description: 'The title of the task',
  })
  @IsString()
  taskName: string;

  @ApiPropertyOptional({
    example: 'Finish the final draft of the API documentation and share it with the team.',
    description: 'Detailed explanation of the task',
  })
  @IsOptional()
  @IsString()
  taskDescription?: string;

  @ApiProperty({
    example: '2026-02-13',
    description: 'Task start date (YYYY-MM-DD)',
  })
  @IsString()
  startDate: string;

  @ApiProperty({
    example: '10:00',
    description: 'Task start time (HH:mm)',
  })
  @IsString()
  startTime: string;

  @ApiProperty({
    example: '2026-02-15',
    description: 'Task end date (YYYY-MM-DD)',
  })
  @IsString()
  endDate: string;

  @ApiProperty({
    example: '18:00',
    description: 'Task end time (HH:mm)',
  })
  @IsString()
  endTime: string;

  @ApiProperty({
    example: 'c560166a-6c8e-4acb-a100-6e2498520ef7',
    description: 'The UUID of the employee to whom the task is assigned',
  })
  @IsUUID()
  assignedToId: string;

  @ApiProperty({
    example: 'e492a68f-4f1e-4b1e-8e0d-5f82cb25f6c3',
    description: 'The UUID of the project this task belongs to',
  })
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional({
    enum: TaskPriority,
    example: TaskPriority.HIGH,
    description: 'Priority of the task',
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;
}
