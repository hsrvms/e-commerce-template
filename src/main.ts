import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './global-filters/http-exception.filter';
import { AllExceptionsFilter } from './global-filters/all-exceptions.filter';
import { I18nMiddleware, I18nService } from 'nestjs-i18n';
import { setupSwagger } from 'config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const NODE_ENV = configService.get<string>('NODE_ENV');
  const port = configService.get<number>('app_port') || 8001;

  const httpAdapterHost = app.get(HttpAdapterHost);
  const i18nService =
    app.get<I18nService<Record<string, unknown>>>(I18nService);

  app.use(I18nMiddleware);
  app.useGlobalFilters(
    new HttpExceptionFilter(configService),
    new AllExceptionsFilter(httpAdapterHost, i18nService),
  );

  setupSwagger(app);

  await app.listen(port, () => {
    console.log(`
      ENVIRONMENT: ${NODE_ENV}
      Server is running on port: ${port}
      `);
  });
}
bootstrap();
