import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('charge')
  @HttpCode(HttpStatus.OK)
  charge(@Body() body: { orderId: string; amount: number; method: string }) {
    return this.paymentsService.charge(body.orderId, body.amount, body.method);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  webhook(@Body() payload: any) {
    return this.paymentsService.handleWebhook(payload);
  }
}
