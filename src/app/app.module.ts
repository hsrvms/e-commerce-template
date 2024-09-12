import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from 'src/logger/logger.middleware';
import { CustomConfigModule } from 'config/customConfig.module';
import { HealthModule } from 'src/health/health.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [CustomConfigModule, HealthModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
