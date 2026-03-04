import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiConsumes, } from '@nestjs/swagger';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('clients')
@Controller('clients')
@ApiBearerAuth('JWT-auth')
export class ClientController {
  constructor(private readonly clientService: ClientService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('logo'))
  @ApiOperation({ summary: 'Create a new client' })
  async create(
    @Body() dto: CreateClientDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.clientService.create(dto, file);
  }


  @Get()
  @ApiOperation({ summary: 'Get all clients' })
  @ApiResponse({ status: 200, description: 'List of clients' })
  findAll() {
    return this.clientService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Client UUID' })
  @ApiResponse({ status: 200, description: 'Client found' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  findOne(@Param('id') id: string) {
    return this.clientService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update client' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', type: 'string', description: 'Client UUID' })
  @ApiBody({ type: UpdateClientDto })
  @ApiResponse({ status: 200, description: 'Client updated successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 409, description: 'Email conflict' })
  @UseInterceptors(FileInterceptor('logo')) 
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.clientService.update(id, dto, file);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete client' })
  @ApiParam({ name: 'id', type: 'string', description: 'Client UUID' })
  @ApiResponse({ status: 204, description: 'Client deleted successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  remove(@Param('id') id: string) {
    return this.clientService.remove(id);
  }
}