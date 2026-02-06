import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { models } from './database-entity';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async (configService: ConfigService) => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: models,
        migrations: [__dirname + '/../../database/migrations/*{.ts,.js}'],
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
      });

      return dataSource.initialize();
    },
    inject: [ConfigService],
  },
];
