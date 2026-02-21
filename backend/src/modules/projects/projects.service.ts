import { Injectable, HttpException, HttpStatus, ConflictException, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { AdminProfile } from 'src/modules/admin/entities/admin-profile.entity';
import { ProjectDocument } from './entities/project-document.entity';
import { Client } from '../client/entities/client.entity';


@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly projectRepository: Repository<Project>,
    @InjectRepository(AdminProfile) private readonly adminProfileRepository: Repository<AdminProfile>,
    @InjectRepository(ProjectDocument) private readonly documentRepository: Repository<ProjectDocument>,
    @InjectRepository(Client) private readonly clientRepository: Repository<Client>,
  ) { }

  async create(dto: CreateProjectDto, userId: string) {
    try {
      if (dto.projectCode) {
        const existing = await this.projectRepository.findOne({ where: { projectCode: dto.projectCode } });
        if (existing) throw new ConflictException(`Project code "${dto.projectCode}" already exists`);
      }
      const adminProfile = await this.adminProfileRepository.findOne({ where: { user: { id: userId } } });
      if (!adminProfile) throw new HttpException('Admin profile not found for this user.', HttpStatus.FORBIDDEN);
      const clientExists = await this.clientRepository.findOne({ where: { id: dto.clientId } });
      if (!clientExists) {
        throw new BadRequestException(`Client with ID "${dto.clientId}" does not exist`);
      }
      const project = this.projectRepository.create({ ...dto, createdBy: adminProfile.id, projectCode: dto.projectCode ?? `PRJ-${Date.now()}` });
      return await this.projectRepository.save(project);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(error.message || 'Failed to create project', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(filterDto: ProjectQueryDto) {
    try {
      const { status, projectType, managerId, search, fromDate, toDate, page, limit, sortOrder } = filterDto;
      const skip = (page - 1) * limit;
      const query = this.projectRepository.createQueryBuilder('project');
      if (status) query.andWhere('project.status = :status', { status });
      if (projectType) query.andWhere('project.projectType = :projectType', { projectType });
      if (managerId) query.andWhere('project.projectManagerId = :managerId', { managerId });
      if (search) query.andWhere('(project.projectName ILIKE :search OR project.projectCode ILIKE :search)', { search: `%${search}%` });
      if (fromDate) query.andWhere('project.startDate >= :fromDate', { fromDate });
      if (toDate) query.andWhere('project.endDate <= :toDate', { toDate });
      query.orderBy('project.createdAt', sortOrder).skip(skip).take(limit);
      const [items, total] = await query.getManyAndCount();
      return { data: items, meta: { totalItems: total, totalPages: Math.ceil(total / limit), currentPage: page } };
    } catch (error) {
      throw new HttpException(error.message || 'Failed to fetch projects', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string) {
    const project = await this.projectRepository.findOne({
      where: { id }, relations: [
        'projectManager',
        'projectLead',
        'creator',
        'client',
        'documents',
        'tasks',]
    });
    if (!project) throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) throw new NotFoundException(`Project with ID "${id}" not found`);
    if (dto.projectCode) {
      const existingByCode = await this.projectRepository.findOne({
        where: { projectCode: dto.projectCode, id: Not(id) },
      });
      if (existingByCode) throw new ConflictException(`Project code "${dto.projectCode}" is already taken`);
    }
    if (dto.clientId) {
      const clientExists = await this.clientRepository.exists?.({ where: { id: dto.clientId } })
        ?? await this.clientRepository.findOne({ where: { id: dto.clientId } });
      if (!clientExists) throw new BadRequestException(`Client ID "${dto.clientId}" is invalid`);
    }
    try {
      this.projectRepository.merge(project, dto);
      return await this.projectRepository.save(project);
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Update failed');
    }
  }

  async remove(id: string) {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    await this.projectRepository.delete(id);
    return { message: 'Project permanently deleted' };
  }

  async uploadDocument(projectId: string, file: Express.Multer.File) {
    const relativePath = file.path.replace(/\\/g, '/');

    const newDocument = this.documentRepository.create({
      fileName: file.originalname,
      fileUrl: relativePath.replace('uploads/', '/uploads/'),
      fileSize: file.size,
      mimeType: file.mimetype,
      projectId,
    });

    return await this.documentRepository.save(newDocument);
  }
}

