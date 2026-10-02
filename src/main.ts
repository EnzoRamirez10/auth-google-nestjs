import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
