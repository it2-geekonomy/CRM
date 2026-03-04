import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
export class ContactDto {
  @ApiPropertyOptional({ example: 'Jane Smith' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'CEO' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'jane@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '0987654321' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Primary' })
  @IsString()
  @IsOptional()
  role?: string;
}