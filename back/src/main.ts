import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
<<<<<<< Updated upstream
=======
import { join } from 'path'
import { NestExpressApplication } from '@nestjs/platform-express';
import 'dotenv/config'
>>>>>>> Stashed changes

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    exposedHeaders: 'Content-Disposition',
    origin: true,
  });
  await app.listen(3000);
}
bootstrap();
