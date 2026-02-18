import {
  Injectable,
  HttpException,
  HttpStatus,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { AdminProfile } from 'src/modules/admin/entities/admin-profile.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(AdminProfile)
    private readonly adminProfileRepository: Repository<AdminProfile>,
  ) { }

  async create(dto: CreateProjectDto, userId: string) {
    if (dto.projectCode) {
      const existing = await this.projectRepository.findOne({
        where: { projectCode: dto.projectCode },
      });
      if (existing) {
        throw new ConflictException(
          `Project code "${dto.projectCode}" already exists`,
        );
      }
    }

    const adminProfile = await this.adminProfileRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!adminProfile) {
      throw new HttpException(
        'Admin profile not found for this user. Cannot create project.',
        HttpStatus.FORBIDDEN,
      );
    }
    const project = this.projectRepository.create({
      ...dto,
      createdBy: adminProfile.id,
      projectCode: dto.projectCode ?? `PRJ-${Date.now()}`,
    });

    return await this.projectRepository.save(project);
  }

  async findAll(filterDto: ProjectQueryDto) {
    const {
      status,
      projectType,
      managerId,
      search,
      fromDate,
      toDate,
      page,
      limit,
      sortOrder,
    } = filterDto;
    const skip = (page - 1) * limit;

    const query = this.projectRepository.createQueryBuilder('project');

    if (status) query.andWhere('project.status = :status', { status });

    if (projectType)
      query.andWhere('project.projectType = :projectType', { projectType });

    if (managerId)
      query.andWhere('project.projectManagerId = :managerId', { managerId });

    if (search) {
      query.andWhere(
        '(project.projectName ILIKE :search OR project.projectCode ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (fromDate) query.andWhere('project.startDate >= :fromDate', { fromDate });

    if (toDate) query.andWhere('project.endDate <= :toDate', { toDate });

    query.orderBy('project.createdAt', sortOrder).skip(skip).take(limit);
    const [items, total] = await query.getManyAndCount();

    return {
      data: items,
      meta: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
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
    const project = await this.projectRepository.findOne({
      where: { projectId: id },
    });
    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }
    if (dto.projectCode !== undefined) {
      const existing = await this.projectRepository.findOne({
        where: { projectCode: dto.projectCode },
      });
      if (existing && existing.projectId !== id) {
        throw new ConflictException(
          `Project code "${dto.projectCode}" already exists`,
        );
      }
    }
    Object.assign(project, dto);
    return await this.projectRepository.save(project);
  }

  async remove(id: string) {
    const project = await this.projectRepository.findOne({
      where: { projectId: id },
    });

    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }

    await this.projectRepository.delete(id);

    return { message: 'Project permanently deleted' };
  }
}