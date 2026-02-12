import {
  IsString,
  IsOptional,
  IsDateString,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TaskStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
  REVIEW='REVIEW',
  ADDRESSED='ADDRESSED'
}

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  taskName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  taskDescription?: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsString()
  startTime: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiProperty()
  @IsString()
  endTime: string;

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  taskStatus?: TaskStatus;

  @ApiProperty()
  @IsUUID()
  assignedToId: string;
}
