import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
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

  /**
   * Sign in (Login) - Validates user credentials and returns JWT token
   * @param createAuthDto - Login credentials (email, password)
   * @returns Access token and user data
   */
  async sign(createAuthDto: CreateAuthDto) {
    // Use the new method that includes the passwordHash
    const user = await this.usersService.getUserByEmailForAuth(createAuthDto.email);

    if (!user) {
      throw new HttpException('Invalid email', HttpStatus.BAD_REQUEST);
    }

    // user.passwordHash will now be defined, so compare() will work!
    const isMatch = await compare(createAuthDto.password, user.passwordHash);

    if (!isMatch) {
      throw new HttpException('Invalid password', HttpStatus.BAD_REQUEST);
    }
    // Step 3: Create JWT payload (data stored in token)
    const payload = {
      sub: user.id, // Subject (user ID)
      email: user.email,
      role: user.role?.name,
    };

    // Step 4: Generate JWT token
    const accessToken = await this.jwtService.signAsync(payload);

    // Step 5: Return token and user data (exclude password)
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
  }
}
