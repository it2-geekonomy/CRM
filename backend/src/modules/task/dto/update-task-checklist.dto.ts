import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTaskChecklistDto } from './create-task-checklist.dto';
import { IsBoolean, IsOptional, IsDateString, IsInt, IsString } from 'class-validator';

export class UpdateTaskChecklistDto extends PartialType(CreateTaskChecklistDto) {

  @ApiPropertyOptional({ example: true, description: 'Mark the item as completed or not' })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @ApiPropertyOptional({ example: '2026-03-07', description: 'Date of the checklist work' })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ example: 2, description: 'Duration hours spent on this checklist item' })
  @IsInt()
  @IsOptional()
  durationHours?: number;

  @ApiPropertyOptional({ example: 30, description: 'Duration minutes spent on this checklist item' })
  @IsInt()
  @IsOptional()
  durationMinutes?: number;

  @ApiPropertyOptional({ example: 'Worked on documentation', description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}