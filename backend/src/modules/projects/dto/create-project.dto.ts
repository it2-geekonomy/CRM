import {
    IsUUID,
    IsDateString,
    IsOptional,
    IsBoolean,
    IsInt,
    IsEnum,
    IsString,
    MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '../../../shared/enum/project/project-status.enum';
import { ProjectType } from '../../../shared/enum/project/project-type.enum';

export class CreateProjectDto {
    @ApiProperty({ example: 'ABC Corp Website Redesign' })
    @IsString()
    @MaxLength(150)
    name: string;

    @ApiPropertyOptional({ example: 'ABC-WEB-001' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    code?: string;

    @ApiPropertyOptional({ example: '6eff1312-88fe-4dd0-a93c-37aff05b5fc7' })
    @IsOptional()
    @IsUUID()
    clientId?: string;

    @ApiProperty({
        enum: ProjectType,
        example: ProjectType.WEBSITE,
    })
    @IsEnum(ProjectType)
    type: ProjectType;

    @ApiPropertyOptional({ example: 'Complete website redesign' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        enum: ProjectStatus,
        example: ProjectStatus.DRAFT,
    })
    @IsEnum(ProjectStatus)
    status: ProjectStatus;

    @ApiProperty({ example: '2026-02-04' })
    @IsDateString()
    startDate: string;

    @ApiProperty({ example: '2026-05-15' })
    @IsDateString()
    endDate: string;

    @ApiPropertyOptional({ example: 320 })
    @IsOptional()
    @IsInt()
    estimatedHours?: number;

    @ApiProperty({ example: '0a86a793-09a6-4f21-9926-67d587a75e31' })
    @IsUUID()
    projectManagerId: string;

    @ApiProperty({ example: '6edc4986-11fa-4747-b47e-b3c95041bffb' })
    @IsUUID()
    projectLeadId: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    requireTimeTracking?: boolean;
}