// explicitly making 'crypto' globally available
// import * as cryptoModule from 'crypto';
// (global as any).crypto = cryptoModule;

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,PUT,PATCH,POST,DELETE',
    credential:'true'
  })

  app.setGlobalPrefix("api/v1");
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  
  const PORT = configService.get<number>('PORT');
  const HOST = configService.get<string>('SERVER_HOST_NAME');

  await app.listen(PORT ?? 3000, HOST || "127.0.0.1",()=> {
    console.log(`Server is running on http://${HOST}:${PORT}`);
  })
}
bootstrap();
