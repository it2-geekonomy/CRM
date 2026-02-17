import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS: allow comma-separated origins; CORS allows only ONE value in
  // Access-Control-Allow-Origin, so we pass an array and the middleware picks the matching origin.
  const corsOrigin = process.env.CORS_ORIGIN;
  let origin: string | string[] = '*';
  
  if (corsOrigin) {
    origin = corsOrigin.split(',').map((s) => s.trim()).filter(Boolean);
  } else {
    // Default: allow localhost and common IP addresses for development
    origin = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://172.31.32.1:3000',
      'http://10.0.0.251:3000',
    ];
  }

  app.enableCors({
    origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are sent
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Enable implicit type conversion
      },
    }),
  );

  // Setup Swagger documentation (only in development)
  if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app);
  }

  const port = process.env.PORT ?? 8080;
  const host = process.env.HOST ?? '0.0.0.0'; // Listen on all interfaces for network access
  await app.listen(port, host);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`🌐 Network access: http://YOUR_IP:${port} (replace YOUR_IP with your machine's IP)`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
  }
}
bootstrap();
