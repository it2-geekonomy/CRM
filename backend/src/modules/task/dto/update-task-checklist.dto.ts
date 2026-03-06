import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTaskChecklistDto } from './create-task-checklist.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTaskChecklistDto extends PartialType(CreateTaskChecklistDto) {
  
  @ApiPropertyOptional({ example: true, description: 'Mark the item as completed or not' })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean; 
}