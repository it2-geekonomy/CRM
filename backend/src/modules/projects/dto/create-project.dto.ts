import {
    IsUUID,
    IsDateString,
    IsOptional,
    IsBoolean,
    IsInt,
    IsEnum,
    IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '../../../shared/enum/project/project-status.enum';
import { ProjectType } from '../../../shared/enum/project/project-type.enum';

export class CreateProjectDto {
    @ApiProperty({ example: 'ABC Corp Website Redesign' })
    @IsString()
    projectName: string;

    @ApiPropertyOptional({ example: 'ABC-WEB-001' })
    @IsOptional()
    projectCode: string;

    // @ApiProperty({ example: 'uuid-client-id' })
    // @IsUUID()
    // clientId: string;

    @ApiProperty({
        enum: ProjectType,
        example: ProjectType.WEBSITE,
    })
    @IsEnum(ProjectType)
    projectType: ProjectType;

    @ApiPropertyOptional({ example: 'Complete website redesign' })
    @IsOptional()
    projectDescription?: string;

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
    estimatedHours: number;

    @ApiProperty({ example: 'uuid-manager-id' })
    @IsUUID()
    projectManagerId: string;

    @ApiProperty({ example: 'uuid-lead-id' })
    @IsUUID()
    projectLeadId: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    requireTimeTracking?: boolean;
}
