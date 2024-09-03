import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path'
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    exposedHeaders: 'Content-Disposition',
    origin: true,
  });
  
  app.use((req, res, next) => {
    const file = req.path.split('/').pop();
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      if (req.path.includes('/assets')) {
        res.sendFile(join(process.env.FRONT_DIST_PATH, 'assets', file));
      } else {
        res.sendFile(join(process.env.FRONT_DIST_PATH, 'index.html'));
      }
    } else {
      next();
    }
  });

  await app.listen(3000);
}
bootstrap();
