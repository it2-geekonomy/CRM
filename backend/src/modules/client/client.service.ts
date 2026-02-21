// src/modules/client/client.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(dto: CreateClientDto) {
    const existing = await this.clientRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException(`Client with email "${dto.email}" already exists`);
    const client = this.clientRepository.create(dto);
    return this.clientRepository.save(client);
  }

  findAll() {
    return this.clientRepository.find();
  }

  async findOne(id: string) {
    const client = await this.clientRepository.findOne({ where: { clientId: id } });
    if (!client) throw new NotFoundException(`Client with id "${id}" not found`);
    return client;
  }

  async update(id: string, dto: UpdateClientDto) {
    const client = await this.findOne(id);
    if (dto.email && dto.email !== client.email) {
      const existing = await this.clientRepository.findOne({ where: { email: dto.email } });
      if (existing) throw new ConflictException(`Client with email "${dto.email}" already exists`);
    }
    Object.assign(client, dto);
    return this.clientRepository.save(client);
  }

  async remove(id: string) {
    const client = await this.findOne(id);
    await this.clientRepository.delete(id);
    return { message: 'Client deleted successfully' };
  }
}