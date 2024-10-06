import { Module } from '@nestjs/common';
import { AuthService, LoginAuditService } from './services';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy, JwtStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginRecord } from './entities';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/guards';

@Module({
  imports: [
    TypeOrmModule.forFeature([LoginRecord]),
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: { expiresIn: configService.get<number>('jwt.expiresIn') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LoginAuditService,
    LocalStrategy,
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AuthModule {}
