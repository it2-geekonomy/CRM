import {
  ConflictException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly rolesService: RolesService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existing = await this.userRepository.findOne({
      where: { email: createUserDto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    let roleId = createUserDto.roleId;
    if (!roleId) {
      const studentRole = await this.rolesService.findByName('student');
      if (!studentRole) {
        throw new BadRequestException('Default role not found');
      }
      roleId = studentRole.id;
    } else {
      const role = await this.rolesService.findOne(roleId);
      if (!role) {
        throw new BadRequestException('Invalid role');
      }
      const allowedSignupRoles = ['student', 'teacher'];
      if (!allowedSignupRoles.includes(role.name)) {
        throw new BadRequestException(
          'Only Student or Teacher accounts can be created here',
        );
      }
    }

    const passwordHash = await hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      email: createUserDto.email.toLowerCase().trim(),
      passwordHash,
      roleId,
      isVerified: false,
    });
    const saved = await this.userRepository.save(user);
    const { passwordHash: _, ...result } = saved;
    return result;
  }

  async findAll() {
    return this.userRepository.find({ relations: ['role'] });
  }

  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id }, relations: ['role'] });
  }

  /**
   * Find user by email - used for authentication
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email }, relations: ['role'] });
  }

  /**
   * Find user by ID - used for authentication
   */
  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id }, relations: ['role'] });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
