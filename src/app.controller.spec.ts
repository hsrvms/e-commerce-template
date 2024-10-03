import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { I18nService, I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from 'src/generated/i18n.generated';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: jest.fn().mockResolvedValue('Hello World'),
          },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockResolvedValue('Hello from i18n'),
          },
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('getHello', () => {
    it('should return "Hello World"', async () => {
      const result = await appController.getHello();
      expect(result).toBe('Hello World');
      expect(appService.getHello).toHaveBeenCalled();
    });
  });

  describe('getI18nHello', () => {
    it('should return "Hello from i18n"', async () => {
      const mockI18nContext = {
        t: jest.fn().mockResolvedValue('Hello from i18n'),
      } as unknown as I18nContext<I18nTranslations>;

      const result = await appController.getI18nHello(mockI18nContext);

      expect(result).toBe('Hello from i18n');
      expect(mockI18nContext.t).toHaveBeenCalledWith('test.hello');
    });
  });

  describe('getException', () => {
    it('should throw a NotFoundException', async () => {
      try {
        await appController.getException();
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toBe('errors.USER_NOT_FOUND');
      }
    });
  });
});
