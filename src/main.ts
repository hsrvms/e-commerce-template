import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './global-filters/http-exception.filter';
import { AllExceptionsFilter } from './global-filters/all-exceptions.filter';
import { I18nMiddleware, I18nService } from 'nestjs-i18n';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(I18nMiddleware);

  const configService = app.get(ConfigService);
  const i18nService =
    app.get<I18nService<Record<string, unknown>>>(I18nService);
  const NODE_ENV = configService.get<string>('NODE_ENV');
  const port = configService.get<number>('app_port') || 8001;

  const httpAdapterHost = app.get(HttpAdapterHost);

  app.useGlobalFilters(
    new HttpExceptionFilter(configService),
    new AllExceptionsFilter(httpAdapterHost, i18nService),
  );

  await app.listen(port, () => {
    console.log(`
      ENVIRONMENT: ${NODE_ENV}
      Server is running on port: ${port}
      `);
  });
}
bootstrap();
