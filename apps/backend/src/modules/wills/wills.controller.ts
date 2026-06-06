import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
  NotFoundException,
  ParseUUIDPipe,
  StreamableFile,
  Header,
} from '@nestjs/common';
import { WillsService } from './wills.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ClarifyRequestDto } from './dto/clarify-request.dto';

import { SnapshotService } from './snapshot.service';
import { ValidationService } from './validation.service';
import { ClarifyService } from './clarify.service';
import { PdfService } from './pdf/pdf.service';
import { PdfFormat } from './pdf/will-pdf.template';
import { UpdateWillDto } from './dto/update-will.dto';

@Controller('wills')
@UseGuards(JwtAuthGuard)
export class WillsController {
  constructor(
    private readonly willsService: WillsService,
    private readonly chatService: ChatService,
    private readonly snapshotService: SnapshotService,
    private readonly validationService: ValidationService,
    private readonly clarifyService: ClarifyService,
    private readonly pdfService: PdfService,
  ) {}

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
  async getWill(
    @CurrentUser() user: User,
    @Param('willId', ParseUUIDPipe) willId: string,
  ) {
    const will = await this.willsService.findByUserIdAndWillId(user.id, willId);
    if (!will) {
      throw new NotFoundException('Will not found');
    }
    return will;
  }

  @Get(':willId/snapshot')
  async getLatestSnapshot(
    @CurrentUser() user: User,
    @Param('willId', ParseUUIDPipe) willId: string,
  ) {
    const will = await this.willsService.findByUserIdAndWillId(user.id, willId);
    if (!will) {
      throw new NotFoundException('Will not found');
    }

    return this.snapshotService.loadSnapshot(willId);
  }

  @Get(':willId/snapshots')
  async getSnapshotHistory(
    @CurrentUser() user: User,
    @Param('willId', ParseUUIDPipe) willId: string,
  ) {
    const will = await this.willsService.findByUserIdAndWillId(user.id, willId);
    if (!will) {
      throw new NotFoundException('Will not found');
    }

    return this.snapshotService.getSnapshotHistory(willId);
  }

  @Get(':willId/pdf/preview')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async previewWillPdf(
    @CurrentUser() user: User,
    @Param('willId', ParseUUIDPipe) willId: string,
    @Query('format') format?: string,
  ) {
    const pdfFormat = this.parsePdfFormat(format);
    const { html } = await this.pdfService.generateWillPdf(user.id, willId, pdfFormat);
    return html;
  }

  @Get(':willId/pdf')
  async downloadWillPdf(
    @CurrentUser() user: User,
    @Param('willId', ParseUUIDPipe) willId: string,
    @Query('format') format?: string,
  ) {
    const pdfFormat = this.parsePdfFormat(format);
    const { buffer, filename } = await this.pdfService.generateWillPdf(user.id, willId, pdfFormat);

    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="${filename}"`,
    });
  }

  @Get(':willId/validation')
  async getValidationState(
    @CurrentUser() user: User,
    @Param('willId', ParseUUIDPipe) willId: string,
  ) {
    const will = await this.willsService.findByUserIdAndWillId(user.id, willId);
    if (!will) {
      throw new NotFoundException('Will not found');
    }

    return this.validationService.validateWill(willId);
  }

  @Patch(':willId')
  async updateWill(
    @CurrentUser() user: User,
    @Param('willId', ParseUUIDPipe) willId: string,
    @Body() updates: UpdateWillDto,
  ) {
    const will = await this.willsService.findByUserIdAndWillId(user.id, willId);
    if (!will) {
      throw new NotFoundException('Will not found');
    }

    const updatedWill = await this.willsService.updateWill(willId, updates);
    if (!updatedWill) {
      throw new NotFoundException('Will not found after update');
    }

    return {
      message: 'Will updated successfully',
      will: updatedWill,
    };
  }

  @Delete(':willId')
  async deleteWill(
    @CurrentUser() user: User,
    @Param('willId', ParseUUIDPipe) willId: string,
  ) {
    const will = await this.willsService.findByUserIdAndWillId(user.id, willId);
    if (!will) {
      throw new NotFoundException('Will not found');
    }

    await this.willsService.deleteWill(willId);
    return {
      message: 'Will deleted successfully',
    };
  }

  @Post(':willId/clarify')
  async clarifyWill(
    @CurrentUser() user: User,
    @Param('willId', ParseUUIDPipe) willId: string,
    @Body() body: ClarifyRequestDto,
  ) {
    return this.clarifyService.processClarification(user.id, willId, body);
  }

  @Post(':willId/chat')
  async chatWithWill(
    @CurrentUser() user: User,

    @Param('willId', ParseUUIDPipe) willId: string,
    @Body() body: ChatRequestDto,
  ) {
    if (!body.message?.trim()) {
      throw new BadRequestException('Message is required');
    }

    return this.chatService.processMessage(user, willId, body.message);
  }

  private parsePdfFormat(format?: string): PdfFormat {
    if (format === 'detailed' || format === 'simplified' || format === 'standard') {
      return format;
    }
    return 'standard';
  }
}
