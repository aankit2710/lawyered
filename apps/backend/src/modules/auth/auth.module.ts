import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { getJwtSecret } from '../../common/config/app-config';

const jwtSignOptions: SignOptions = {
  expiresIn: (process.env.JWT_EXPIRATION ?? '24h') as SignOptions['expiresIn'],
};

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: getJwtSecret(),
      signOptions: jwtSignOptions,
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
