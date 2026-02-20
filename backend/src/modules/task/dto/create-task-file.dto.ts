import { ApiConsumes, ApiBody, ApiProperty } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

export class CreateTaskFileDto {

  @ApiProperty({ type: 'string', format: 'binary', description: 'File to upload' })
  file: any;
}