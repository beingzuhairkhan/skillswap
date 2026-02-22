import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    app.enableCors({
      origin: [
        'https://skillswap-upmw.vercel.app',
        'https://skillswap-iota-three.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001',
      ],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    await app.listen(4000);
    console.log('NestJS server running on http://localhost:4000');
  } catch (err) {
    console.error('Error starting NestJS:', err);
  }
}
bootstrap();
