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

@Module({
  imports: [
    TypeOrmModule.forFeature([LoginRecord]),
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: { expiresIn: '60h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LoginAuditService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
