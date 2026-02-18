import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsDateString, IsUUID } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'employee1@company.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: '9876543210', required: false })
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: '9999999999', required: false })
  @IsOptional()
  alternatePhone?: string;

  @ApiProperty({ example: 'Sales Executive' })
  @IsString()
  designation: string;

  @ApiProperty({ example: 'FULL_TIME' })
  @IsString()
  employmentType: string;

  @ApiProperty({ example: '2026-02-06' })
  @IsDateString()
  dateOfJoining: string;

  @ApiProperty({ example: 'Bangalore' })
  @IsString()
  location: string;

  @ApiProperty({
    example: '368b74cc-5534-4911-884f-74ebe856d54a',
    description: 'Department UUID',
  })
  @IsUUID()
  departmentId: string;
}
