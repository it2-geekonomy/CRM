import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getDatabaseConfig } from '../../typeOrm/config';

/**
 * NestJS Database Configuration
 * 
 * This imports the database config from typeOrm/config.ts (single source of truth)
 * and registers it with NestJS ConfigModule.
 */
export default registerAs(
  'database',
  (): TypeOrmModuleOptions => getDatabaseConfig(),
);
