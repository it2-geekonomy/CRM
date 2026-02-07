import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';
import { CreateEmployeeDto } from './create-employee.dto';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '9999999999' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: '8888888888' })
  @IsOptional()
  alternatePhone?: string;

  @ApiPropertyOptional({ example: 'Senior Sales Executive' })
  @IsOptional()
  designation?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  dateOfExit?: string;

  @ApiPropertyOptional({
    example: '368b74cc-5534-4911-884f-74ebe856d54a',
  })
  @IsOptional()
  departmentId?: string;
}
