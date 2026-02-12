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
