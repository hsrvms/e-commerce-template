import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './global-filters/http-exception.filter';
import { AllExceptionsFilter } from './global-filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const NODE_ENV = configService.get<string>('NODE_ENV');
  const port = configService.get<number>('app_port') || 8001;

  const httpAdapterHost = app.get(HttpAdapterHost);

  app.useGlobalFilters(
    new HttpExceptionFilter(configService),
    new AllExceptionsFilter(httpAdapterHost),
  );

  await app.listen(port, () => {
    console.log(`
      ENVIRONMENT: ${NODE_ENV}
      Server is running on port: ${port}
      `);
  });
}
bootstrap();
