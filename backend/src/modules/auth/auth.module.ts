import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RedisModule } from '../redis/redis.module';
import { ValidateCpfService, AuthService, CreatePasswordService } from './services';

@Module({
  imports: [
    PassportModule,
    RedisModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    ValidateCpfService, 
    JwtStrategy, 
    JwtAuthGuard,
    CreatePasswordService
  ],
  exports: [JwtAuthGuard],
})
export class AuthModule {}