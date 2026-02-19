import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminProfile } from './entities/admin-profile.entity';
import { CreateAdminProfileDto } from './dto/create-admin-profile.dto';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../../shared/enum/user-roles';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminProfile)
    private readonly adminProfileRepository: Repository<AdminProfile>,
    private readonly usersService: UsersService,
  ) { }

  async create(dto: CreateAdminProfileDto) {
    try {
      const user = await this.usersService.getUserById(dto.userId);
      if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

      if (user.role?.name !== UserRole.ADMIN) {
        throw new HttpException('User must have role admin', HttpStatus.BAD_REQUEST);
      }

      const existing = await this.adminProfileRepository.findOne({ where: { userId: dto.userId } });
      if (existing) {
        throw new HttpException('Admin profile already exists for this user', HttpStatus.CONFLICT);
      }

      const profile = this.adminProfileRepository.create({
        userId: dto.userId,
        name: dto.name,
        bio: dto.bio ?? null,
        isActive: dto.isActive ?? true,
      });

      return await this.adminProfileRepository.save(profile);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(error.message || 'Failed to create admin profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll() {
    const list = await this.adminProfileRepository.find({
      relations: ['user', 'user.role'],
      order: { createdAt: 'DESC' },
    });
    return list.map((p) => this.sanitizeProfile(p));
  }

  async findOne(id: string) {
    const profile = await this.adminProfileRepository.findOne({
      where: { id },
      relations: ['user', 'user.role'],
    });
    if (!profile) throw new HttpException('Admin profile not found', HttpStatus.NOT_FOUND);
    return this.sanitizeProfile(profile);
  }

  async findByUserId(userId: string) {
    const profile = await this.adminProfileRepository.findOne({
      where: { userId },
      relations: ['user', 'user.role'],
    });
    if (!profile) throw new HttpException('Admin profile not found', HttpStatus.NOT_FOUND);
    return this.sanitizeProfile(profile);
  }

  private sanitizeProfile(profile: AdminProfile) {
    if (profile.user && 'passwordHash' in profile.user) {
      const { passwordHash, ...user } = profile.user;
      return { ...profile, user };
    }
    return profile;
  }

  async update(id: string, dto: UpdateAdminProfileDto) {
    try {
      const profile = await this.adminProfileRepository.findOne({ where: { id } });
      if (!profile) throw new HttpException('Admin profile not found', HttpStatus.NOT_FOUND);

      if (dto.userId !== undefined) {
        const user = await this.usersService.getUserById(dto.userId);
        if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        if (user.role?.name !== UserRole.ADMIN) {
          throw new HttpException('User must have role admin', HttpStatus.BAD_REQUEST);
        }

        const existing = await this.adminProfileRepository.findOne({ where: { userId: dto.userId } });
        if (existing && existing.id !== id) {
          throw new HttpException('Admin profile already exists for this user', HttpStatus.CONFLICT);
        }
      }

      Object.assign(profile, {
        ...(dto.userId !== undefined && { userId: dto.userId }),
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      });

      return await this.adminProfileRepository.save(profile);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(error.message || 'Failed to update admin profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string) {
    const profile = await this.adminProfileRepository.findOne({ where: { id } });
    if (!profile) throw new HttpException('Admin profile not found', HttpStatus.NOT_FOUND);
    await this.adminProfileRepository.remove(profile);
  }
}
