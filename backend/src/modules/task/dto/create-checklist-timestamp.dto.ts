import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateChecklistTimestampDto {

  @ApiProperty({ example: 'uuid-of-checklist' })
  @IsUUID()
  checklistId: string;

  @ApiProperty({ example: '2026-03-07' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  hours: number;

  @ApiProperty({ example: 30 })
  @IsInt()
  minutes: number;

  @ApiProperty({ example: 'Worked on API', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}