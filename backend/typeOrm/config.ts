import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';
import { models } from '../src/database/database-entity';

// Load environment variables from .env file for TypeORM CLI
config();

/**
 * Database Configuration
 * 
 * This is the single source of truth for database configuration.
 * Used by both NestJS application and TypeORM CLI.
 */

// Base database configuration
export const getDatabaseConfig = (): DataSourceOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'course_portal',
  entities: models, // Entities from database-entity.ts
  migrations: [join(__dirname, 'migrations', '*.ts')],
  synchronize: false, // DISABLED: Tables created ONLY through migrations
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// DataSource instance for TypeORM CLI (migrations)
export default new DataSource({
  ...getDatabaseConfig(),
  synchronize: false, // Never use synchronize in CLI - always use migrations
});
