import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ProjectType } from './entities/project-type.entity';
import { Department } from '../department/entities/department.entity';
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
      const departments = await this.departmentRepo.find({
        where: { id: In(dto.departmentIds) },
      });

      if (departments.length !== dto.departmentIds.length) {
        throw new NotFoundException('One or more Department IDs were not found');
      }

      const existing = await this.repo.findOne({ where: { name: dto.name } });
      if (existing) throw new ConflictException('Project type name already exists');

      const projectType = this.repo.create({
        ...dto,
        departments: departments,
      });
      const saved = await this.repo.save(projectType);

      return await this.findOne(saved.id);
    } catch (err) {
      if (err instanceof ConflictException || err instanceof NotFoundException)
        throw err;
      throw new InternalServerErrorException(
        err.message || 'Failed to create project type',
      );
    }
  }

  async findAll() {
    return await this.repo.find({
      relations: ['departments'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const type = await this.repo.findOne({
      where: { id },
      relations: ['departments'],
    });
    if (!type)
      throw new NotFoundException(`Project Type with ID ${id} not found`);
    return type;
  }

  async update(id: string, dto: UpdateProjectTypeDto) {
    const type = await this.findOne(id);

    if (dto.departmentIds && Array.isArray(dto.departmentIds)) {
      const departments = await this.departmentRepo.find({
        where: { id: In(dto.departmentIds) },
      });

      if (departments.length !== dto.departmentIds.length) {
        throw new NotFoundException('One or more Department IDs were not found');
      }

      type.departments = departments;
    }

    const { departmentIds, ...updateData } = dto;
    Object.assign(type, updateData);

    const updated = await this.repo.save(type);

    return await this.findOne(updated.id);
  }

  async remove(id: string) {
    const type = await this.findOne(id);
    await this.repo.softRemove(type);
    return { message: 'Project type deactivated successfully' };
  }

  async restore(id: string) {
    const type = await this.repo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!type || !type.deletedAt) {
      throw new NotFoundException(
        `Soft-deleted Project Type with ID ${id} not found`,
      );
    }
    await this.repo.restore(id);

    return { message: 'Project type restored successfully' };
  }
}