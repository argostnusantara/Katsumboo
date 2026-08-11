import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as compression from 'compression';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Pino Logger
  app.useLogger(app.get(Logger));

  // Security headers (Helmet)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https:'],
      },
    },
    referrerPolicy: { policy: 'same-origin' },
  }));

  // CORS config – izinkan semua port localhost (untuk dev) + production origin
  const allowedOriginsEnv = (process.env.ALLOWED_ORIGIN || '').split(',').filter(Boolean);
  app.enableCors({
    origin: (origin, callback) => {
      // Izinkan request tanpa origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      // Semua localhost (port berapapun)
      if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
      // Origin dari env var (production domain)
      if (allowedOriginsEnv.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: origin ${origin} tidak diizinkan`), false);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // Cookie Parser
  app.use(cookieParser());

  // Compression
  app.use(compression());

  // Global validation pipeline
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Global exception filter (consistent error format)
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global response transform (consistent success format)
  app.useGlobalInterceptors(new TransformInterceptor());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`NestJS server running on port ${port}`);
}
bootstrap();

