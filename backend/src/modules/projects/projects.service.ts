import {
  Injectable,
  HttpException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';

import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';

import { AdminProfile } from 'src/modules/admin/entities/admin-profile.entity';
import { EmployeeProfile } from '../employee/entities/employee-profile.entity';
import { Client } from '../client/entities/client.entity';
import { ProjectType } from '../project-type/entities/project-type.entity';
import { ProjectDocument } from './entities/project-document.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(AdminProfile)
    private readonly adminProfileRepository: Repository<AdminProfile>,

    @InjectRepository(EmployeeProfile)
    private readonly employeeProfileRepository: Repository<EmployeeProfile>,

    @InjectRepository(ProjectDocument)
    private readonly documentRepository: Repository<ProjectDocument>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(ProjectType)
    private readonly projectTypeRepository: Repository<ProjectType>,
  ) { }

  async create(dto: CreateProjectDto, userId: string) {
    try {
      if (dto.code) {
        const existing = await this.projectRepository.findOne({
          where: { code: dto.code },
        });

        if (existing) {
          throw new ConflictException(`Project code "${dto.code}" already exists`);
        }
      }

      const adminProfile = await this.adminProfileRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!adminProfile) throw new NotFoundException('Admin profile not found');

      const client = dto.clientId
        ? await this.clientRepository.findOne({ where: { id: dto.clientId } })
        : null;

      if (dto.clientId && !client)
        throw new NotFoundException('Client not found');

      const projectType = dto.projectTypeId
        ? await this.projectTypeRepository.findOne({
          where: { id: dto.projectTypeId },
        })
        : null;

      if (dto.projectTypeId && !projectType)
        throw new NotFoundException('Project type not found');

      const manager = dto.projectManagerId
        ? await this.adminProfileRepository.findOne({
          where: { id: dto.projectManagerId },
        })
        : null;

      if (dto.projectManagerId && !manager)
        throw new NotFoundException('Project manager not found');

      const lead = dto.projectLeadId
        ? await this.employeeProfileRepository.findOne({
          where: { id: dto.projectLeadId },
        })
        : null;

      if (dto.projectLeadId && !lead)
        throw new NotFoundException('Project lead not found');

      let teamMembersEntities: EmployeeProfile[] = [];

      if (dto.teamMembers?.length) {
        teamMembersEntities = await this.employeeProfileRepository.find({
          where: { id: In(dto.teamMembers) },
        });
      }

      const { teamMembers, ...projectData } = dto;

      const project = this.projectRepository.create({
        ...projectData,
        createdBy: adminProfile.id,
        code: dto.code ?? `PRJ-${Date.now()}`,
        teamMembers: teamMembersEntities,
      });

      const saved = await this.projectRepository.save(project);

      return {
        id: saved.id,
        name: saved.name,
        code: saved.code,
        status: saved.status,
        createdAt: saved.createdAt,
      };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;

      throw new BadRequestException(error.message || 'Failed to create project');
    }
  }

  async findAll(filterDto: ProjectQueryDto) {
    const { page = 1, limit = 10, sortOrder = 'ASC', search, status } = filterDto;

    const skip = (page - 1) * limit;

    const query = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.projectType', 'projectType')
      .leftJoinAndSelect('project.projectManager', 'projectManager')
      .leftJoinAndSelect('project.projectLead', 'projectLead')
      .leftJoinAndSelect('project.creator', 'creator')
      .leftJoinAndSelect('project.client', 'client')
      .leftJoinAndSelect('project.teamMembers', 'teamMembers')
      .loadRelationCountAndMap('project.taskCount', 'project.tasks')
      .loadRelationCountAndMap('project.documentCount', 'project.documents');

    // Search filter
    if (search) {
      query.andWhere('project.name ILIKE :search', {
        search: `%${search}%`,
      });
    }
    if (status) {
      query.andWhere('project.status = :status', { status });
    }
    query.skip(skip).take(limit).orderBy('project.createdAt', sortOrder);

    const [projects, total] = await query.getManyAndCount();

    return {
      data: projects.map((p) => {
        if (!p.projectType) (p as any).projectType = 'deactivated';
        return p;
      }),
      meta: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async findOne(id: string) {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: [
        'projectManager',
        'projectLead',
        'teamMembers',
        'creator',
        'client',
        'documents',
        'tasks',
        'projectType',
        'projectType.departments',
      ],
    });

    if (!project)
      throw new NotFoundException(`Project with ID "${id}" not found`);

    if (!project.projectType) {
      (project as any).projectType = 'deactivated';
    }

    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['teamMembers'],
    });

    if (!project)
      throw new NotFoundException(`Project with ID "${id}" not found`);

    if (dto.code) {
      const existing = await this.projectRepository.findOne({
        where: { code: dto.code, id: Not(id) },
      });

      if (existing) {
        throw new ConflictException(`Project code "${dto.code}" is already taken`);
      }
    }

    try {
      if (dto.projectTypeId) {
        const projectType = await this.projectTypeRepository.findOne({
          where: { id: dto.projectTypeId },
        });

        if (!projectType)
          throw new NotFoundException('Project type not found');

        project.projectType = projectType;
      }

      if (dto.clientId) {
        const client = await this.clientRepository.findOne({
          where: { id: dto.clientId },
        });

        if (!client) throw new NotFoundException('Client not found');

        project.client = client;
      }

      if (dto.projectManagerId) {
        const manager = await this.adminProfileRepository.findOne({
          where: { id: dto.projectManagerId },
        });

        if (!manager)
          throw new NotFoundException('Project manager not found');

        project.projectManager = manager;
      }

      if (dto.projectLeadId) {
        const lead = await this.employeeProfileRepository.findOne({
          where: { id: dto.projectLeadId },
        });

        if (!lead) throw new NotFoundException('Project lead not found');

        project.projectLead = lead;
      }

      if (dto.teamMembers !== undefined) {
        if (dto.teamMembers.length === 0) {
          project.teamMembers = [];
        } else {
          const teamMembersEntities =
            await this.employeeProfileRepository.find({
              where: { id: In(dto.teamMembers) },
            });

          project.teamMembers = teamMembersEntities;
        }
      }

      const { teamMembers, ...updateData } = dto;

      this.projectRepository.merge(project, updateData);

      await this.projectRepository.save(project);

      return this.findOne(id);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;

      throw new BadRequestException(`Database Error: ${error.message}`);
    }
  }

  async remove(id: string) {
    const project = await this.projectRepository.findOne({
      where: { id },
    });

    if (!project)
      throw new NotFoundException(`Project with ID "${id}" not found`);

    await this.projectRepository.delete(id);

    return { message: 'Project permanently deleted' };
  }

  async uploadDocument(projectId: string, file: Express.Multer.File) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project)
      throw new NotFoundException(`Project with ID "${projectId}" not found`);

    const relativePath = file.path.replace(/\\/g, '/');

    const document = this.documentRepository.create({
      name: file.originalname,
      url: relativePath.replace('uploads/', '/uploads/'),
      size: file.size,
      mimeType: file.mimetype,
      projectId,
    });

    return this.documentRepository.save(document);
  }

  async findAllDocuments(projectId: string) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project)
      throw new NotFoundException(`Project with ID "${projectId}" not found`);

    return this.documentRepository.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneDocument(documentId: string) {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['project'],
    });

    if (!document)
      throw new NotFoundException(`Document with ID "${documentId}" not found`);

    return document;
  }

  async removeDocument(documentId: string) {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document)
      throw new NotFoundException(`Document with ID "${documentId}" not found`);

    await this.documentRepository.remove(document);

    return { message: 'Document deleted successfully' };
  }
}