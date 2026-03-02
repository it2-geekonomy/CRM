import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { Client } from './entities/client.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client]),

    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/clients',
        filename: (req, file, cb) => {
          const uniqueName =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueName + extname(file.originalname));
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  ],
  controllers: [ClientController],
  providers: [ClientService],
})
export class ClientModule {}