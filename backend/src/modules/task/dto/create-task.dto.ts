import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TaskStatus } from '../../../shared/enum/task/task-status.enum';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Prepare CRM Dashboard',
    description: 'Name/title of the task',
  })
  @IsString()
  taskName: string;

  @ApiProperty({
    example: 'Create dashboard UI and integrate APIs',
    description: 'Detailed description of the task',
  })
  @IsString()
  taskDescription: string;

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
    example: '85504988-efda-4928-a980-bba3f92e4fa6',
    description: 'Employee ID to whom the task is assigned',
  })
  @IsUUID()
  assignedToId: string;
}
