import { Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectType } from './entities/project-type.entity';
import { Department } from '../department/entities/department.entity'; // Adjust path
import { CreateProjectTypeDto } from './dto/create-project-type.dto';
import { UpdateProjectTypeDto } from './dto/update-project-type.dto';

@Injectable()
export class ProjectTypeService {
  constructor(
    @InjectRepository(ProjectType)
    private readonly repo: Repository<ProjectType>,

    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
  ) { }

  async create(dto: CreateProjectTypeDto) {
    try {
      const department = await this.departmentRepo.findOne({
        where: { id: dto.departmentId },
      });
      if (!department) {
        throw new NotFoundException(`Department with ID ${dto.departmentId} not found`);
      }
      const existing = await this.repo.findOne({ where: { name: dto.name } });
      if (existing) throw new ConflictException('Project type name already exists');
      const projectType = this.repo.create({
        ...dto,
        department,
      });
      return await this.repo.save(projectType);
    } catch (err) {
      if (err instanceof ConflictException || err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(err.message || 'Failed to create project type');
    }
  }

  async findAll() {
    return await this.repo.find({
      relations: ['department'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const type = await this.repo.findOne({
      where: { id },
      relations: ['department'],
    });
    if (!type) throw new NotFoundException(`Project Type with ID ${id} not found`);
    return type;
  }

  async update(id: string, dto: UpdateProjectTypeDto) {
    const type = await this.findOne(id);

    if (dto.departmentId) {
      const department = await this.departmentRepo.findOne({
        where: { id: dto.departmentId },
      });
      if (!department) throw new NotFoundException('Department not found');
      type.department = department;
    }
    Object.assign(type, dto);
    await this.repo.save(type);
    return this.findOne(id);
  }

  async remove(id: string) {
    const type = await this.findOne(id);
    await this.repo.remove(type);
    return { message: 'Project type deleted successfully' };
  }
}