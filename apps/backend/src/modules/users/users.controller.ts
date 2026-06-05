import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { PublicUser, sanitizeUser } from './user.mapper';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: User): Promise<PublicUser> {
    const profile = await this.usersService.getProfile(user.id);
    return sanitizeUser(profile);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updates: { firstName?: string; lastName?: string }
  ): Promise<PublicUser> {
    const updated = await this.usersService.updateProfile(user.id, updates);
    return sanitizeUser(updated);
  }
}
