import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  async sign(createAuthDto: CreateAuthDto) {
    try {
      const user = await this.usersService.getUserByEmailForAuth(createAuthDto.email);
      if (!user) throw new HttpException('Invalid email', HttpStatus.BAD_REQUEST);

      const isMatch = await compare(createAuthDto.password, user.passwordHash);
      if (!isMatch) throw new HttpException('Invalid password', HttpStatus.BAD_REQUEST);

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role?.name,
      };

      const accessToken = await this.jwtService.signAsync(payload);

      return {
        accessToken: `Bearer ${accessToken}`,
        user: {
          id: user.id,
          email: user.email,
          role: user.role?.name,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Authentication failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
