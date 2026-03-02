// src/modules/client/dto/create-client.dto.ts
import { 
  IsString, IsOptional, IsEmail, MaxLength, 
  IsNumber, IsArray, IsBoolean, IsDateString, IsUUID,
  ValidateNested 
} from 'class-validator';
import { Type, Transform, plainToInstance } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContactDto } from './contact.dto';

export class CreateClientDto {
  @ApiProperty({ example: 'Tech Solutions Inc' })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: 'contact@techsolutions.com' })
  @IsEmail()
  @MaxLength(150)
  email: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Client logo file' })
  @IsOptional()
  logo?: any;

  @ApiPropertyOptional({ example: 'CLNT-001' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  clientCode?: string;

  @ApiPropertyOptional({ example: 'Technology' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @ApiPropertyOptional({ example: '50-100' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  companySize?: string;

  @ApiPropertyOptional({ example: 'https://techsolutions.com' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string;

  @ApiPropertyOptional({ example: 'TAX123456' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  taxId?: string;

  @ApiPropertyOptional({ example: '123 Main St' })
  @IsOptional()
  @IsString()
  streetAddress?: string;

  @ApiPropertyOptional({ example: 'New York' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'NY' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '10001' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({ example: 'USA' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Stringified Array of client contacts',
    example: '[{"name":"Jane Smith","title":"CEO","email":"jane@example.com","phone":"0987654321","role":"Primary"}]'
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactDto)
  @Transform(({ value }) => {
    if (!value) return [];

    try {
      const parsed =
        typeof value === 'string' ? JSON.parse(value) : value;

      return plainToInstance(ContactDto, parsed);
    } catch {
      return [];
    }
  })
  contacts?: ContactDto[];

  @ApiPropertyOptional({ example: 'Net 30' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentTerms?: string;

  @ApiPropertyOptional({ example: 'INR - Indian Rupee' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  currency?: string;

  @ApiPropertyOptional({ example: 'Bank Transfer' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber()
  creditLimit?: number;

  @ApiPropertyOptional({ example: 'Send invoices via email' })
  @IsOptional()
  @IsString()
  billingNotes?: string;

  @ApiPropertyOptional({ example: '2023-01-01' })
  @IsOptional()
  @IsDateString()
  clientSince?: string;

  @ApiPropertyOptional({ example: 'uuid-of-sales-manager-profile' })
  @IsOptional()
  @IsUUID()
  salesManagerId?: string;

  @ApiPropertyOptional({ example: 'High value client' })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}