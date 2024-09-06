import {
  Catch,
  HttpException,
  ExceptionFilter,
  Logger,
  ArgumentsHost,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private configService: ConfigService) {}
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    this.logger.error(
      `Exception: ${exception.message}, status: ${status}, stack: ${exception.stack}`,
    );

    response.status(status).json(
      isProduction
        ? {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: exception.message,
          }
        : {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: exception.message,
            stacktrace: exception.stack,
          },
    );
  }
}
