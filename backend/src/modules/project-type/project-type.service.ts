import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectType } from './entities/project-type.entity';
import { CreateProjectTypeDto } from './dto/create-project-type.dto';
import { UpdateProjectTypeDto } from './dto/update-project-type.dto';

@Injectable()
export class ProjectTypeService {
  constructor(
    @InjectRepository(ProjectType)
    private readonly repo: Repository<ProjectType>,
  ) {}

  async create(dto: CreateProjectTypeDto) {
    const existing = await this.repo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Project type name already exists');

    const projectType = this.repo.create(dto);
    return await this.repo.save(projectType);
  }

  async findAll() {
    return await this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const type = await this.repo.findOne({ where: { id } });
    if (!type) throw new NotFoundException(`Project Type with ID ${id} not found`);
    return type;
  }

  async update(id: string, dto: UpdateProjectTypeDto) {
    const type = await this.findOne(id);
    Object.assign(type, dto);
    return await this.repo.save(type);
  }

  async remove(id: string) {
    const type = await this.findOne(id);
    await this.repo.remove(type);
    return { message: 'Project type deleted successfully' };
  }
}