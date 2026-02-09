import {
  Injectable,
  HttpException,
  HttpStatus,
  ConflictException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) { }

  async create(dto: CreateProjectDto, adminId: string) {
    if (dto.projectCode) {
      const existing = await this.projectRepository.findOne({
        where: { projectCode: dto.projectCode },
      });
      if (existing) {
        throw new ConflictException(`Project code "${dto.projectCode}" already exists`);
      }
    }
    const project = this.projectRepository.create({
      ...dto,
      createdBy: adminId,
      projectCode: dto.projectCode ?? `PRJ-${Date.now()}`,
    });
    return await this.projectRepository.save(project);
  }

  findAll() {
    return this.projectRepository.find({
      relations: ['projectManager', 'projectLead', 'creator'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const project = await this.projectRepository.findOne({
      where: { projectId: id },
      relations: ['projectManager', 'projectLead', 'creator'],
    });

    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }
    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.projectRepository.findOne({ where: { projectId: id } });
    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }
    if (dto.projectCode !== undefined) {
      const existing = await this.projectRepository.findOne({
        where: { projectCode: dto.projectCode },
      });
      if (existing && existing.projectId !== id) {
        throw new ConflictException(`Project code "${dto.projectCode}" already exists`);
      }
    }
    Object.assign(project, dto);
    return await this.projectRepository.save(project);
  }

  async remove(id: string) {
    const project = await this.projectRepository.findOne({ where: { projectId: id } });
    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }
    await this.projectRepository.softDelete(id);
    return { message: 'Project archived successfully' };
  }

  async restore(id: string) {
    const project = await this.projectRepository.findOne({
      where: { projectId: id },
      withDeleted: true,
    });
    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }
    await this.projectRepository.restore(id);
    return { message: 'Project restored successfully' };
  }
}