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
import { mapWarningsToI18nKeys } from 'src/common';

type ErrorResponseBody = {
  statusCode: number;
  timestamp: string;
  path: string;
  error: string | unknown;
  warnings?: string[];
};

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
    const i18nContext = I18nContext.current();
    const lang = i18nContext ? i18nContext.lang : 'en';

    const message = exceptionResponse.message
      ? exceptionResponse.message
      : 'errors.GENERIC_ERROR';
    const translatedMessage = await this.i18n.t(message, { lang });

    const warnings = exceptionResponse.warnings;
    let translatedWarnings;
    if (warnings) {
      translatedWarnings = await this._translateWarnings(warnings);
    }
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody: ErrorResponseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      error: translatedMessage,
      warnings: translatedWarnings,
    };

    this.logger.error(`Exception: ${translatedMessage}, status: ${httpStatus}`);

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  private async _translateWarnings(warnings: string[]): Promise<string[]> {
    const warningKeys: string[] = mapWarningsToI18nKeys(warnings);
    const i18nContext = I18nContext.current();
    const lang = i18nContext ? i18nContext.lang : 'en';
    const translatedWarnings: string[] = await Promise.all(
      warningKeys.map((key) => this.i18n.t(key, { lang })),
    );
    return translatedWarnings;
  }
}
