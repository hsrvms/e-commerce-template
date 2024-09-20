import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { I18nService, I18nContext } from 'nestjs-i18n';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(
    private httpAdapterHost: HttpAdapterHost,
    private readonly i18n: I18nService,
  ) {}

  async catch(exception: any, host: ArgumentsHost): Promise<void> {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const exceptionResponse = exception.getResponse();
    this.logger.debug('exceptionResponse', exceptionResponse);
    const i18nContext = I18nContext.current();
    const lang = i18nContext ? i18nContext.lang : 'en';

    const message = exceptionResponse.message
      ? exceptionResponse.message
      : 'errors.GENERIC_ERROR';
    const translatedMessage = await this.i18n.t(message, { lang });

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      error: translatedMessage,
      reasons: exceptionResponse.reasons,
    };

    this.logger.error(
      `Exception: ${exception?.message}, status: ${httpStatus}, stack: ${exception?.stack}`,
    );

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
