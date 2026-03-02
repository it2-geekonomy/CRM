import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  const corsOrigin = process.env.CORS_ORIGIN;
  const origin = corsOrigin
    ? corsOrigin.split(',').map((s) => s.trim()).filter(Boolean)
    : '*';

  app.enableCors({
    origin,
    credentials: true,
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
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
  }
}
bootstrap();