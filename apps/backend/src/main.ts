import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { validateProductionEnv } from './common/config/app-config';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

function parseCorsOrigins(): string | string[] {
  const raw = process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:3000';
  const origins = raw.split(',').map(origin => origin.trim()).filter(Boolean);
  return origins.length === 1 ? origins[0] : origins;
}

async function bootstrap() {
  validateProductionEnv();

  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.enableShutdownHooks();
  const bodyLimit = process.env.REQUEST_BODY_LIMIT || '1mb';
  app.use(json({ limit: bodyLimit }));
  app.use(urlencoded({ extended: true, limit: bodyLimit }));

  if (process.env.TRUST_PROXY === 'true') {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }

  app.use(helmet());
  app.use(compression());

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: parseCorsOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = process.env.BACKEND_PORT || 3001;
  await app.listen(port);
  logger.log(`Lawyered Backend running on http://localhost:${port}/api`);
}

bootstrap();
