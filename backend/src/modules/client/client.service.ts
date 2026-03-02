import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) { }

  async create(dto: CreateClientDto, file?: Express.Multer.File) {
    const emailExisting = await this.clientRepository.findOne({ where: { email: dto.email } });
    if (emailExisting) throw new ConflictException(`Client with email "${dto.email}" already exists`);

    if (dto.clientCode) {
      const codeExisting = await this.clientRepository.findOne({ where: { clientCode: dto.clientCode } });
      if (codeExisting) throw new ConflictException(`Client code "${dto.clientCode}" is already in use`);
    }

    let logoUrl: string | undefined;
    if (file) {
      logoUrl = `/uploads/clients/${file.filename}`;
    }

    const { logo, ...clientData } = dto;
    const client = this.clientRepository.create({
      ...clientData,
      logoUrl,
      salesManagerId: dto.salesManagerId
    });

    return await this.clientRepository.save(client);
  }

  async findAll() {
    return this.clientRepository.find({
      relations: ['salesManager'],
    });
  }

  async findOne(id: string) {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['salesManager'],
    });
    if (!client) throw new NotFoundException(`Client with id "${id}" not found`);
    return client;
  }

  async update(id: string, dto: UpdateClientDto, file?: Express.Multer.File) {
    const client = await this.findOne(id);

    if (dto.clientCode && dto.clientCode !== client.clientCode) {
      const exists = await this.clientRepository.findOne({
        where: { clientCode: dto.clientCode, id: Not(id) },
      });
      if (exists) throw new ConflictException('Client code already in use');
    }

    if (dto.email && dto.email !== client.email) {
      const exists = await this.clientRepository.findOne({
        where: { email: dto.email, id: Not(id) },
      });
      if (exists) throw new ConflictException('Email already exists');
    }

    let logoUrl = client.logoUrl;

    if (file) {
      if (client.logoUrl) {
        const oldPath = path.join(process.cwd(), client.logoUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      logoUrl = `/uploads/clients/${file.filename}`;
    }

    const { logo, ...dtoData } = dto;
    Object.assign(client, { ...dtoData, logoUrl });

    return this.clientRepository.save(client);
  }

  async remove(id: string) {
    const client = await this.findOne(id);

    if (client.logoUrl) {
      const filePath = path.join(process.cwd(), client.logoUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await this.clientRepository.delete(id);
    return { message: 'Client deleted successfully' };
  }
}