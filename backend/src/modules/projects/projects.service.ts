import { Injectable, HttpException, HttpStatus, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { AdminProfile } from 'src/modules/admin/entities/admin-profile.entity';
import { ProjectDocument } from './entities/project-document.entity';
import { Client } from '../client/entities/client.entity';
import { EmployeeProfile } from '../employee/entities/employee-profile.entity';
import { ProjectType } from '../project-type/entities/project-type.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly projectRepository: Repository<Project>,
    @InjectRepository(AdminProfile) private readonly adminProfileRepository: Repository<AdminProfile>,
    @InjectRepository(EmployeeProfile) private readonly employeeProfileRepository: Repository<EmployeeProfile>,
    @InjectRepository(ProjectDocument) private readonly documentRepository: Repository<ProjectDocument>,
    @InjectRepository(Client) private readonly clientRepository: Repository<Client>,
    @InjectRepository(ProjectType) private readonly projectTypeRepository: Repository<ProjectType>,
  ) { }

  async create(dto: CreateProjectDto, userId: string) {
    try {
      if (dto.code) {
        const existing = await this.projectRepository.findOne({ where: { code: dto.code } });
        if (existing) throw new ConflictException(`Project code "${dto.code}" already exists`);
      }

      const adminProfile = await this.adminProfileRepository.findOne({ where: { user: { id: userId } } });
      if (!adminProfile) throw new HttpException('Admin profile not found for this user.', HttpStatus.FORBIDDEN);

      if (dto.projectTypeId) {
        const typeExists = await this.projectTypeRepository.findOne({ where: { id: dto.projectTypeId } });
        if (!typeExists) throw new NotFoundException(`Project Type with ID "${dto.projectTypeId}" not found`);
      }

      if (dto.clientId) {
        const clientExists = await this.clientRepository.findOne({ where: { id: dto.clientId } });
        if (!clientExists) throw new BadRequestException(`Client with ID "${dto.clientId}" does not exist`);
      }

      if (dto.projectManagerId) {
        const managerExists = await this.adminProfileRepository.findOne({ where: { id: dto.projectManagerId } });
        if (!managerExists) throw new NotFoundException(`Project Manager with ID "${dto.projectManagerId}" not found`);
      }

      if (dto.projectLeadId) {
        const leadExists = await this.employeeProfileRepository.findOne({ where: { id: dto.projectLeadId }, });
        if (!leadExists) throw new NotFoundException(`Project Lead with ID "${dto.projectLeadId}" not found`);
      }

      const project = this.projectRepository.create({
        ...dto,
        createdBy: adminProfile.id,
        code: dto.code ?? `PRJ-${Date.now()}`,
      });

      return await this.projectRepository.save(project);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const dbDetail = (error as any).detail || error.message;
      throw new BadRequestException(`Database Error: ${dbDetail}`);
    }
  }

  async findAll(filterDto: ProjectQueryDto) {
    try {
      const { status, projectTypeId, managerId, search, fromDate, toDate, page, limit, sortOrder } = filterDto;
      const skip = (page - 1) * limit;
      const query = this.projectRepository.createQueryBuilder('project');

      if (status) query.andWhere('project.status = :status', { status });
      if (projectTypeId) query.andWhere('project.projectTypeId = :projectTypeId', { projectTypeId });
      if (managerId) query.andWhere('project.projectManagerId = :managerId', { managerId });

      if (search) {
        query.andWhere('(project.name ILIKE :search OR project.code ILIKE :search)', { search: `%${search}%` });
      }

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
      where: { id },
      relations: ['projectManager', 'projectLead', 'creator', 'client', 'documents', 'tasks', 'projectType'],
    });
    if (!project) throw new NotFoundException(`Project with ID "${id}" not found`);
    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) throw new NotFoundException(`Project with ID "${id}" not found`);

    if (dto.code) {
      const existingByCode = await this.projectRepository.findOne({
        where: { code: dto.code, id: Not(id) },
      });
      if (existingByCode) throw new ConflictException(`Project code "${dto.code}" is already taken`);
    }

    if (dto.projectTypeId) {
      const typeExists = await this.projectTypeRepository.findOne({ where: { id: dto.projectTypeId } });
      if (!typeExists) throw new NotFoundException(`Project Type with ID "${dto.projectTypeId}" not found`);
    }

    if (dto.clientId) {
      const clientExists = await this.clientRepository.findOne({ where: { id: dto.clientId } });
      if (!clientExists) throw new BadRequestException(`Client ID "${dto.clientId}" is invalid`);
    }

    if (dto.projectManagerId) {
      const managerExists = await this.adminProfileRepository.findOne({ where: { id: dto.projectManagerId } });
      if (!managerExists) throw new NotFoundException(`Project Manager with ID "${dto.projectManagerId}" not found`);
    }

    if (dto.projectLeadId) {
      const leadExists = await this.employeeProfileRepository.findOne({ where: { id: dto.projectLeadId } });
      if (!leadExists) throw new NotFoundException(`Project Lead with ID "${dto.projectLeadId}" not found`);
    }

    try {
      this.projectRepository.merge(project, dto);
      return await this.projectRepository.save(project);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const dbDetail = (error as any).detail || error.message;
      throw new BadRequestException(`Database Error: ${dbDetail}`);
    }
  }

  async remove(id: string) {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) throw new NotFoundException(`Project with ID "${id}" not found`);
    await this.projectRepository.delete(id);
    return { message: 'Project permanently deleted' };
  }

  async uploadDocument(projectId: string, file: Express.Multer.File) {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException(`Project with ID "${projectId}" not found`);

    const relativePath = file.path.replace(/\\/g, '/');
    const newDocument = this.documentRepository.create({
      name: file.originalname,
      url: relativePath.replace('uploads/', '/uploads/'),
      size: file.size,
      mimeType: file.mimetype,
      projectId,
    });

    return await this.documentRepository.save(newDocument);
  }

  async findAllDocuments(projectId: string) {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException(`Project with ID "${projectId}" not found`);

    return await this.documentRepository.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneDocument(documentId: string) {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['project']
    });
    if (!document) throw new NotFoundException(`Document with ID "${documentId}" not found`);
    return document;
  }

  async removeDocument(documentId: string) {
    const document = await this.documentRepository.findOne({ where: { id: documentId } });
    if (!document) throw new NotFoundException(`Document with ID "${documentId}" not found`);

    await this.documentRepository.remove(document);
    return { message: 'Document deleted successfully' };
  }
}