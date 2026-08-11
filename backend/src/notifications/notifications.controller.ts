import { Controller, Get, Patch, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';
import { GetUser } from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  getAll(@GetUser('id') userId: string) {
    return this.notificationsService.getForUser(userId);
  }

  @Get('unread-count')
  getUnreadCount(@GetUser('id') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.notificationsService.markRead(id);
  }

  @Patch('read-all')
  markAllRead(@GetUser('id') userId: string) {
    return this.notificationsService.markAllRead(userId);
  }

  @Post('broadcast')
  @UseGuards(RolesGuard)
  @Roles('ADMIN' as any, 'SUPER_ADMIN' as any)
  broadcast(@Body() body: { type: string; title: string; body: string }) {
    return this.notificationsService.sendToAllUsers(body);
  }

  @Post()
  create(@GetUser('id') userId: string, @Body() body: { type: string; title: string; body: string; voucherCode?: string }) {
    return this.notificationsService.create(userId, body);
  }
}
