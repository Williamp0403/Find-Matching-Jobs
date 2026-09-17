import { NestFactory } from '@nestjs/core';
import {
  ValidationPipe,
  ClassSerializerInterceptor,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import session from 'express-session';
import helmet from 'helmet';
import serverless from 'serverless-http';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

let cachedApp: any;

async function bootstrapServerless() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (errors) => {
          const formatted = errors.map((e) => ({
            field: e.property,
            message: Object.values(e.constraints || {})[0],
          }));
          return new BadRequestException(formatted);
        },
      }),
    );

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    app.use((req: any, _res: any, next: any) => {
      console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
      );
      next();
    });

    app.use(helmet());

    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3001',
      credentials: true,
    });

    const config = new DocumentBuilder()
      .setTitle('Find Matching Jobs API')
      .setDescription('API for job matching system with AI')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    app.use(
      session({
        secret: process.env.JWT_SECRET || 'secret',
        resave: false,
        saveUninitialized: false,
      }),
    );

    await app.init();
    cachedApp = app.getHttpAdapter().getInstance();
  }

  return cachedApp;
}

export const handler = async (req: any, res: any) => {
  const expressApp = await bootstrapServerless();
  return expressApp(req, res);
};
