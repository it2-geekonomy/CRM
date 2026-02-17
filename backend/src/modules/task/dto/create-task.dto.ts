import {
  IsString,
  IsOptional,
  IsDateString,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from 'src/shared/enum/task/task-status.enum';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Complete Project Documentation',
    description: 'The title of the task'
  })
  @IsString()
  taskName: string;

  @ApiPropertyOptional({
    example: 'Finish the final draft of the API documentation and share it with the team.',
    description: 'Detailed explanation of the task'
  })
  @IsOptional()
  @IsString()
  taskDescription?: string;

  @ApiProperty({
    example: '2024-05-15',
    description: 'Format: YYYY-MM-DD'
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '09:00:00',
    description: 'Format: HH:mm:ss'
  })
  @IsString()
  startTime: string;

  @ApiProperty({
    example: '2024-05-15',
    description: 'Format: YYYY-MM-DD'
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    example: '17:00:00',
    description: 'Format: HH:mm:ss'
  })
  @IsString()
  endTime: string;

  @ApiPropertyOptional({
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  taskStatus?: TaskStatus;

  @ApiProperty({
    example: 'c560166a-6c8e-4acb-a100-6e2498520ef7',
    description: 'The UUID of the employee profile'
  })
  @IsUUID()
  assignedToId: string;

  @ApiProperty({
    example: 'e492a68f-4f1e-4b1e-8e0d-5f82cb25f6c3',
    description: 'The UUID of the project this task belongs to'
  })
  @IsUUID()
  projectId: string;
}
