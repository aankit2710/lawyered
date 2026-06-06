import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PublicUser, sanitizeUser } from '../users/user.mapper';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('register')
  async register(@Body() body: RegisterDto): Promise<any> {
    return this.authService.register(body.email, body.password, body.firstName, body.lastName);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  async login(@Body() body: LoginDto): Promise<any> {
    return this.authService.login(body.email, body.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: User): Promise<PublicUser> {
    return sanitizeUser(user);
  }
}
