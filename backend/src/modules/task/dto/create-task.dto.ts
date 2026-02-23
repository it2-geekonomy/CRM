import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '../../../shared/enum/task/task-status.enum';
import { TaskPriority } from '../../../shared/enum/task/task-priority.enum';

export class CreateTaskDto {

  @ApiProperty({ example: 'Complete Project Documentation' })
  @IsString()
  name: string; 

  @ApiPropertyOptional({ example: 'Finish the final draft...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-02-13' })
  @IsString()
  startDate: string;

  @ApiProperty({ example: '10:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '2026-02-15' })
  @IsString()
  endDate: string;

  @ApiProperty({ example: '18:00' })
  @IsString()
  endTime: string;

  @ApiProperty({ example: 'c560166a-6c8e-4acb-a100-6e2498520ef7' })
  @IsUUID()
  assignedToId: string;

  @ApiProperty({ example: 'e492a68f-4f1e-4b1e-8e0d-5f82cb25f6c3' })
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional({ enum: TaskPriority, example: TaskPriority.HIGH })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({ example: 'f3b2c6a1-4d2e-4c92-9f21-7f7a8e4c1a22' })
  @IsUUID()
  taskTypeId: string;

}