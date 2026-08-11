import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

export interface PaymentGateway {
  charge(orderId: string, amount: number, method: string): Promise<any>;
  verifyNotification(payload: any): Promise<any>;
}

@Injectable()
export class PaymentsService {
  private clientKey: string;
  private serverKey: string;
  private isProduction: boolean;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.clientKey = this.configService.get<string>('MIDTRANS_CLIENT_KEY') || '';
    this.serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY') || '';
    this.isProduction = this.configService.get<string>('MIDTRANS_IS_PRODUCTION') === 'true';
  }

  // Gateway charge integration (Mock for now, easy to replace with Midtrans SDK later)
  async charge(orderId: string, amount: number, method: string) {
    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        method,
        amount,
        status: 'Pending',
        transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      },
    });

    return {
      success: true,
      paymentId: payment.id,
      transactionId: payment.transactionId,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
    };
  }

  async handleWebhook(payload: any) {
    // When webhook fires, check signature/payload and update DB status
    const orderId = payload.order_id || payload.orderId;
    const transactionStatus = payload.transaction_status || payload.status;
    const fraudStatus = payload.fraud_status;

    let paymentStatus = 'Pending';
    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'challenge') {
        paymentStatus = 'Pending';
      } else {
        paymentStatus = 'Success';
      }
    } else if (
      transactionStatus === 'cancel' ||
      transactionStatus === 'deny' ||
      transactionStatus === 'expire'
    ) {
      paymentStatus = 'Failed';
    }

    const payment = await this.prisma.payment.findFirst({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    if (payment) {
      const updatedPayment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: paymentStatus },
      });

      // Update related Order paymentStatus
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: paymentStatus === 'Success' ? 'Paid' : paymentStatus === 'Failed' ? 'Failed' : 'Pending',
        },
      });

      // Store webhook logs
      await this.prisma.transaction.create({
        data: {
          paymentId: payment.id,
          rawResponse: payload,
        },
      });

      return updatedPayment;
    }

    throw new BadRequestException('Pembayaran untuk pesanan ini tidak ditemukan.');
  }
}
