import { IsOptional, IsString, IsEnum, IsInt, Min, IsUUID, IsDateString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '../../../shared/enum/project/project-status.enum';
import { ProjectType } from '../../../shared/enum/project/project-type.enum';

export class ProjectQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ProjectStatus })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({ enum: ProjectType })
  @IsOptional()
  @IsEnum(ProjectType)
  projectType?: ProjectType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  managerId?: string; // Synchronized with service destructuring

  @ApiPropertyOptional({ description: 'Filter projects starting from this date' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Filter projects ending before this date' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  // @ApiPropertyOptional({ default: false })
  // @IsOptional()
  // @Type(() => Boolean)
  // @IsBoolean()
  // isArchived?: boolean = false;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder: 'ASC' | 'DESC' = 'DESC';
}