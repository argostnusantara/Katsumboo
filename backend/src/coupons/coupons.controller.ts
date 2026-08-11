import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CouponsService } from './coupons.service';
import { GetUser } from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { NotificationsService } from '../notifications/notifications.service';

@Controller('coupons')
export class CouponsController {
  constructor(
    private couponsService: CouponsService,
    private notificationsService: NotificationsService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN' as any, 'SUPER_ADMIN' as any)
  getAll() {
    return this.couponsService.getAll();
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN' as any, 'SUPER_ADMIN' as any)
  create(@Body() body: any) {
    return this.couponsService.create(body);
  }

  @Get('validate')
  @UseGuards(AuthGuard('jwt'))
  validate(
    @Query('code') code: string,
    @Query('subtotal') subtotal: string,
    @GetUser('id') userId: string,
  ) {
    return this.couponsService.validate(code, userId, parseFloat(subtotal));
  }

  @Post(':id/send')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN' as any, 'SUPER_ADMIN' as any)
  send(@Param('id') id: string, @Body('userId') userId: string) {
    return this.couponsService.sendToUser(id, userId, this.notificationsService);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN' as any, 'SUPER_ADMIN' as any)
  delete(@Param('id') id: string) {
    return this.couponsService.delete(id);
  }
}
