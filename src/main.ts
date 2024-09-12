import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './global-filters/http-exception.filter';
import { AllExceptionsFilter } from './global-filters/all-exceptions.filter';
import { I18nMiddleware, I18nService } from 'nestjs-i18n';
import { setupSwagger } from 'config/swagger.config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = new Logger('Bootstrap');
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
  app.enableShutdownHooks();

  try {
    await app.listen(port);
    const appUrl = await app.getUrl();
    logger.warn(`Environment: ${NODE_ENV}`);
    logger.log(`Application is running on: ${appUrl}`);
  } catch (err) {
    logger.error('Error starting the application', err.stack);
  }
}
bootstrap();
