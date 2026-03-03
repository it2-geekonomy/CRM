import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS: allow comma-separated origins; CORS allows only ONE value in
  // Access-Control-Allow-Origin. With credentials: true, origin cannot be '*' — use explicit origins.

  const corsOrigin = process.env.CORS_ORIGIN;
  const defaultOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
  let originList = corsOrigin
    ? corsOrigin.split(',').map((s) => s.trim()).filter(Boolean)
    : defaultOrigins;
  if (process.env.NODE_ENV !== 'production') {
    originList = Array.from(new Set([...defaultOrigins, ...originList]));
  }
  const allowedSet = new Set(originList.map((o) => o.replace(/\/$/, '')));

  const originAllowed = (reqOrigin: string | undefined): boolean => {
    if (!reqOrigin) return false;
    const normalized = reqOrigin.replace(/\/$/, '');
    return allowedSet.has(normalized);
  };

  app.enableCors({
    origin: (origin, callback) => {
      if (originAllowed(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // ✅ Enable Class Serializer (IMPORTANT for @Exclude)
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app);
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
  }
}
bootstrap();