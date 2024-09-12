import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from 'src/generated/i18n.generated';

@Injectable()
export class AppService {
  constructor(private readonly i18n: I18nService<I18nTranslations>) {}
  async getHello(): Promise<string> {
    const i18nContext = I18nContext.current();
    const lang = i18nContext ? i18nContext.lang : 'en';
    return await this.i18n.t('test.hello', { lang });
  }
}
