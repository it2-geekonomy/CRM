import { IsString, IsUUID, IsOptional, MaxLength, IsBoolean, IsNumber,IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskTypeStatus } from 'src/shared/enum/task/task-type-status.enum';

export class CreateTaskTypeDto {
  @ApiProperty({
    example: 'Bug Fix',
    description: 'Name of the task type',
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: 'Tasks related to fixing software bugs',
    description: 'Optional description of task type',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '9e99a38-b3df-43e9-b626-2ee9fb812143',
    description: 'Department ID this task type belongs to',
  })
  @IsUUID()
  departmentId: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  billable?: boolean;

  @ApiPropertyOptional({ example: 24 })
  @IsOptional()
  @IsNumber()
  slaHours?: number;

  @ApiPropertyOptional({ enum: TaskTypeStatus, example: TaskTypeStatus.ACTIVE })
  @IsOptional()
  @IsEnum(TaskTypeStatus)
  status?: TaskTypeStatus;
}