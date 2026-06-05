import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { WillsService } from './wills.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('wills')
@UseGuards(JwtAuthGuard)
export class WillsController {
  constructor(private willsService: WillsService) {}

  @Post()
  async createWill(@CurrentUser() user: User, @Body('title') title?: string) {
    const will = await this.willsService.create(user.id, title);
    return {
      message: 'Will created successfully',
      will,
    };
  }

  @Get()
  async getUserWills(@CurrentUser() user: User) {
    const wills = await this.willsService.findAllByUserId(user.id);
    return {
      count: wills.length,
      wills,
    };
  }

  @Get(':willId')
  async getWill(@CurrentUser() user: User, @Param('willId') willId: string) {
    const will = await this.willsService.findByUserIdAndWillId(user.id, willId);
    if (!will) {
      throw new NotFoundException('Will not found');
    }
    return will;
  }

  @Patch(':willId')
  async updateWill(
    @CurrentUser() user: User,
    @Param('willId') willId: string,
    @Body() updates: Partial<any>,
  ) {
    const will = await this.willsService.findByUserIdAndWillId(user.id, willId);
    if (!will) {
      throw new NotFoundException('Will not found');
    }

    const updatedWill = await this.willsService.updateWill(willId, updates);
    return {
      message: 'Will updated successfully',
      will: updatedWill,
    };
  }

  @Delete(':willId')
  async deleteWill(@CurrentUser() user: User, @Param('willId') willId: string) {
    const will = await this.willsService.findByUserIdAndWillId(user.id, willId);
    if (!will) {
      throw new NotFoundException('Will not found');
    }

    await this.willsService.deleteWill(willId);
    return {
      message: 'Will deleted successfully',
    };
  }
}
