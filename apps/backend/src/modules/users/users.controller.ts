import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: User): Promise<any> {
    const profile = await this.usersService.getProfile(user.id);
    const { password, ...result } = profile;
    return result;
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updates: { firstName?: string; lastName?: string },
  ): Promise<any> {
    const updated = await this.usersService.updateProfile(user.id, updates);
    const { password, ...result } = updated;
    return result;
  }
}
