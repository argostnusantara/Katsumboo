import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ShippingService } from './shipping.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('shipping')
export class ShippingController {
  constructor(private shippingService: ShippingService) {}

  @Get('store-status')
  getStoreOpen() {
    return this.shippingService.getStoreOpen();
  }

  @Post('store-status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN' as any, 'SUPER_ADMIN' as any)
  setStoreOpen(@Body('storeOpen') storeOpen: boolean) {
    return this.shippingService.setStoreOpen(storeOpen);
  }

  @Get('couriers')
  getCouriers() {
    return this.shippingService.getCouriers();
  }

  @Post('couriers')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN' as any, 'SUPER_ADMIN' as any)
  createCourier(@Body() body: any) {
    return this.shippingService.createCourier(body);
  }

  @Put('couriers/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN' as any, 'SUPER_ADMIN' as any)
  updateCourier(@Param('id') id: string, @Body() body: any) {
    return this.shippingService.updateCourier(id, body);
  }

  @Delete('couriers/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN' as any, 'SUPER_ADMIN' as any)
  deleteCourier(@Param('id') id: string) {
    return this.shippingService.deleteCourier(id);
  }
}
