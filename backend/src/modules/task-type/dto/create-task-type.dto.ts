import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
}