import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { GetUser } from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  create(@GetUser('id') userId: string, @Body() body: any) {
    return this.ordersService.createOrder(userId, body);
  }

  @Get('my')
  getMyOrders(@GetUser('id') userId: string) {
    return this.ordersService.getOrders(userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN' as any, 'SUPER_ADMIN' as any)
  getAll() {
    return this.ordersService.getAllOrders();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN' as any, 'SUPER_ADMIN' as any)
  updateStatus(@Param('id') id: string, @Body() body: { status: string; courierName?: string; courierPhone?: string }) {
    return this.ordersService.updateStatus(id, body.status, body.courierName, body.courierPhone);
  }

  @Post(':id/review')
  submitReview(@Param('id') id: string, @Body() body: { rating: number; comment: string }) {
    return this.ordersService.submitReview(id, body.rating, body.comment);
  }
}
