import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetCalendarDto {
  @ApiPropertyOptional({ example: '2026' })
  @IsOptional()
  @IsString()
  year?: string;

  @ApiPropertyOptional({ example: '02' })
  @IsOptional()
  @IsString()
  month?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  employeeId?: string;
}