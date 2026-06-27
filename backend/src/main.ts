import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://localhost:3000',
      'https://food-ordering-system.vercel.app',
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `Server is running on http://localhost:${process.env.PORT ?? 3000}`,
  );
}
bootstrap();
