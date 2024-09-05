import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './logger/logger.middleware';
import { RedisConfigService } from 'config/redis.config';
import { CustomConfigModule } from 'config/customConfig.module';

@Module({
  imports: [
    CustomConfigModule,
    CacheModule.registerAsync({
      useClass: RedisConfigService,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
