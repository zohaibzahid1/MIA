import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';
import * as session from 'express-session';
import * as passport from 'passport';
import { graphqlUploadExpress } from 'graphql-upload-minimal';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'supersecret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // false for HTTP
        httpOnly: true,
        sameSite: 'lax', // 'none' requires secure: true, so fallback to lax for HTTP
      },
    }),
  );


  app.use(passport.initialize());
  app.use(passport.session());

  // Enable CORS for frontend communication
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3001',
      'https://localhost:3001', // Add HTTPS version if needed
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Apollo-Operation-Name',
      'Apollo-Require-Preflight'],
  });

  // Enable global validation pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,

  }));
  //files upload

  // 👇 enable multipart upload handling
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 5 }));

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
