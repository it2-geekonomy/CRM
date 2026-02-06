import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Step 1: Check if route is marked as public
    const isPublic = this.isPublicRoute(context);
    if (isPublic) {
      return true; // Allow access without authentication
    }

    // Step 2: Get request object
    const request = context.switchToHttp().getRequest<Request>();
    
    // Step 3: Extract token from Authorization header
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authorization token missing');
    }

    // Step 4: Validate token and get payload
    const payload = await this.validateToken(token);
    
    // Step 5: Attach user payload to request for use in controllers
    request['user'] = payload;
    
    return true;
  }

  /**
   * Check if route is marked as public using @Public() decorator
   */
  private isPublicRoute(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  /**
   * Extract JWT token from Authorization header
   * Format: "Bearer <token>"
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }

  /**
   * Validate JWT token and return payload
   */
  private async validateToken(token: string) {
    try {
      const secret = this.configService.get<string>('JWT_SECRET') || 'default-secret-key';
      return await this.jwtService.verifyAsync(token, {
        secret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
