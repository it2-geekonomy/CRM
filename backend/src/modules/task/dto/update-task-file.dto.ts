import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateTaskFileDto {
  @ApiProperty()
  @IsString()
  name: string;
}