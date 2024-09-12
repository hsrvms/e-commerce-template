import { Controller, Get, NotFoundException } from '@nestjs/common';
import { AppService } from './app.service';
import { I18n, I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from 'src/generated/i18n.generated';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<string> {
    return await this.appService.getHello();
  }

  @Get('/hello')
  async getI18nHello(
    @I18n() i18n: I18nContext<I18nTranslations>,
  ): Promise<string> {
    return await i18n.t('test.hello');
  }

  @Get('/exception')
  async getException(): Promise<string> {
    throw new NotFoundException('errors.USER_NOT_FOUND');
    return await 'no exception';
  }
}
