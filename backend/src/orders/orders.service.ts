import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(userId: string, data: any) {
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const order = await this.prisma.order.create({
      data: {
        id: orderId,
        userId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        address: data.address,
        subtotal: data.subtotal,
        discount: data.discount || 0,
        shippingFee: data.shippingFee,
        grandTotal: data.grandTotal,
        paymentMethod: data.paymentMethod,
        paymentStatus: 'Pending',
        status: 'Pending',
        distanceKm: data.distanceKm || 0,
        platform: data.platform || 'Katsumboo Direct',
        mapCoords: data.mapCoords || null,
        statusTimestamps: { pending: new Date().toISOString() },
        orderItems: {
          create: (data.items || []).map((item: any) => ({
            productId: item.id || null,
            name: item.name,
            desc: item.desc,
            price: item.price,
            image: item.image,
            category: item.category,
            quantity: item.quantity,
            selectedSauce: item.selectedSauce,
            levelPedas: item.levelPedas,
            selectedCustomizations: item.selectedCustomizations || null,
          })),
        },
      },
      include: { orderItems: true },
    });

    // Mark vouchers as used
    if (data.voucherCodes && Array.isArray(data.voucherCodes)) {
      for (const code of data.voucherCodes) {
        const coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
        if (coupon) {
          const usedBy: string[] = (coupon.usedByUserIds as string[]) || [];
          if (!usedBy.includes(userId)) {
            await this.prisma.coupon.update({
              where: { code: code.toUpperCase() },
              data: { usedByUserIds: [...usedBy, userId] },
            });
          }
        }
      }
    }

    return order;
  }

  async getOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { orderItems: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllOrders() {
    return this.prisma.order.findMany({
      include: { orderItems: true, user: { include: { profile: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });
    if (!order) throw new NotFoundException('Pesanan tidak ditemukan.');
    return order;
  }

  async updateStatus(id: string, status: string, courierName?: string, courierPhone?: string) {
    const order = await this.getOrderById(id);
    const timestamps = (order.statusTimestamps as any) || {};
    if (status === 'Cooking') timestamps.cooking = new Date().toISOString();
    if (status === 'Shipping') timestamps.shipping = new Date().toISOString();
    if (status === 'Completed') timestamps.completed = new Date().toISOString();

    return this.prisma.order.update({
      where: { id },
      data: {
        status,
        statusTimestamps: timestamps,
        ...(courierName && { courierName }),
        ...(courierPhone && { courierPhone }),
        ...(status === 'Completed' && { paymentStatus: 'Paid' }),
      },
    });
  }

  async submitReview(id: string, rating: number, comment: string) {
    return this.prisma.order.update({
      where: { id },
      data: { reviews: { rating, comment, date: new Date().toISOString() } },
    });
  }
}
