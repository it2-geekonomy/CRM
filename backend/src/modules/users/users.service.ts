import {
  ConflictException,
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { hash } from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { RolesService } from '../roles/roles.service';
import { AdminProfile } from '../admin/entities/admin-profile.entity';
import { EmployeeProfile } from '../employee/entities/employee-profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly rolesService: RolesService,
    private readonly dataSource: DataSource,
  ) { }

  async getUserById(id: string): Promise<User> {
    return this.findOne(id);
  }

  async create(createUserDto: CreateUserDto) {
    const emailNormalized = createUserDto.email.toLowerCase().trim();

    const existing = await this.userRepository.findOne({ where: { email: emailNormalized } });
    if (existing) throw new ConflictException('Email already registered');

    let role;
    if (!createUserDto.roleId) {
      role = await this.rolesService.findByName('employee');
      if (!role) throw new BadRequestException('Default employee role not found in database');
    } else {
      role = await this.rolesService.findOne(createUserDto.roleId);
      if (!role) throw new BadRequestException('Invalid role ID');
    }

    const roleName = role.name.toLowerCase();
    const passwordHash = await hash(createUserDto.password, 10);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = queryRunner.manager.create(User, {
        email: emailNormalized,
        passwordHash,
        roleId: role.id,
        isVerified: false,
      });

      const savedUser = await queryRunner.manager.save(user);
      const defaultName = emailNormalized.split('@')[0];

      if (roleName === 'admin') {
        await queryRunner.manager.save(AdminProfile, {
          user: savedUser,
          name: defaultName,
          isActive: true,
        });
      } else {
        await queryRunner.manager.save(EmployeeProfile, {
          user: savedUser,
          name: defaultName,
          isActive: true,
          department: { id: createUserDto.departmentId },
          designation: 'New Joinee',
          employmentType: 'FULL_TIME',
          employmentStatus: 'ACTIVE',
          location: 'Remote',
          dateOfJoining: new Date(),
        });
      }

      await queryRunner.commitTransaction();

      const { passwordHash: _, ...result } = savedUser;
      return result;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to create user and profile');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return this.userRepository.find({
      relations: ['role', 'adminProfile', 'employeeProfile'],
      select: {
        id: true,
        email: true,
        roleId: true,
        isVerified: true,
        createdAt: true,
      }
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role', 'adminProfile', 'employeeProfile']
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async getUserByEmailForAuth(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'passwordHash', 'isVerified', 'createdAt', 'updatedAt'],
      relations: ['role'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    const updateData: any = { ...updateUserDto };

    if (updateUserDto.password) {
      updateData.passwordHash = await hash(updateUserDto.password, 10);
      delete updateData.password;
    }

    await this.userRepository.save({ ...user, ...updateData });
    return this.findOne(id);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return { message: 'User deleted successfully' };
  }
}