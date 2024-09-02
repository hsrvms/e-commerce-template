import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const NODE_ENV = configService.get<string>('NODE_ENV');
  const port = configService.get<number>('app_port') || 8001;

  await app.listen(port, () => {
    console.log(`
      ENVIRONMENT: ${NODE_ENV}
      Server is running on port: ${port}
      `);
  });
}
bootstrap();
