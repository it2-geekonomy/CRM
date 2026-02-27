import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateProjectTypeDto {
  @ApiProperty({ example: 'Enterprise ERP' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    description: 'List of Department UUIDs',
    example: [
      'c93170eb-e04f-4769-a902-b0a24071b3d5', 
      'acee0e13-8538-48d8-927c-5dcf0451fdca'
    ],
    type: [String] 
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsNotEmpty()
  departmentIds: string[];

  @ApiProperty({ required: false, example: 'High-level business systems' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}