import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class TaskQueryDto {
    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ example: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;

    @ApiPropertyOptional({
        description:
            'Search by task name, assigned employee name, project name, or status',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        example: 'createdAt',
        enum: ['createdAt', 'taskName', 'startDate', 'endDate', 'taskStatus'],
    })
    @IsOptional()
    @IsIn(['createdAt', 'taskName', 'startDate', 'endDate', 'taskStatus'])
    sortBy?:
        | 'createdAt'
        | 'taskName'
        | 'startDate'
        | 'endDate'
        | 'taskStatus' = 'createdAt';

    @ApiPropertyOptional({ example: 'DESC', enum: ['ASC', 'DESC'] })
    @IsOptional()
    @IsIn(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC' = 'DESC';

    @ApiPropertyOptional({
        description: 'Filter tasks by department ID',
    })
    @IsOptional()
    @IsUUID()
    departmentId?: string;

    @ApiPropertyOptional({
        description: 'Filter tasks by project ID',
        example: 'uuid-project-id',
    })
    @IsOptional()
    @IsUUID()
    projectId?: string;

    @ApiPropertyOptional({ description: 'Filter tasks by Task Type ID' })
    @IsOptional()
    @IsUUID()
    taskTypeId?: string;
}


