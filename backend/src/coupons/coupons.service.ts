import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(data: {
    code: string; type: string; value: number;
    minPurchase: number; description: string; maxUses?: number;
  }) {
    return this.prisma.coupon.create({ data: { ...data, code: data.code.toUpperCase() } });
  }

  async validate(code: string, userId: string, subtotal: number) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon) throw new NotFoundException('Kode voucher tidak ditemukan.');

    const usedBy: string[] = (coupon.usedByUserIds as string[]) || [];
    if (usedBy.includes(userId)) throw new BadRequestException('Voucher ini sudah pernah kamu gunakan.');

    const totalUsed = usedBy.length;
    if (totalUsed >= coupon.maxUses) throw new BadRequestException('Voucher sudah habis digunakan.');

    if (subtotal < coupon.minPurchase) {
      throw new BadRequestException(`Minimum pembelian Rp ${coupon.minPurchase.toLocaleString('id-ID')} untuk voucher ini.`);
    }

    let discount = 0;
    if (coupon.type === 'fixed') discount = coupon.value;
    else if (coupon.type === 'percent') discount = Math.round((subtotal * coupon.value) / 100);
    else if (coupon.type === 'free_shipping') discount = coupon.value;

    return { valid: true, discount, coupon };
  }

  async markUsed(code: string, userId: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon) return;
    const usedBy: string[] = (coupon.usedByUserIds as string[]) || [];
    if (!usedBy.includes(userId)) {
      await this.prisma.coupon.update({
        where: { code: code.toUpperCase() },
        data: { usedByUserIds: [...usedBy, userId] },
      });
    }
  }

  async delete(id: string) {
    await this.prisma.coupon.delete({ where: { id } });
    return { message: 'Voucher berhasil dihapus.' };
  }

  async sendToUser(couponId: string, userId: string, notificationsService: any) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id: couponId } });
    if (!coupon) throw new NotFoundException('Voucher tidak ditemukan.');

    const sentTo: string[] = (coupon.sentToUserIds as string[]) || [];
    if (!sentTo.includes(userId)) {
      await this.prisma.coupon.update({
        where: { id: couponId },
        data: { sentToUserIds: [...sentTo, userId] },
      });
    }

    await notificationsService.create(userId, {
      type: 'voucher',
      title: '🎟️ Voucher Spesial Untukmu!',
      body: `Kamu mendapatkan voucher ${coupon.code}! ${coupon.description}`,
      voucherCode: coupon.code,
    });

    return { message: 'Voucher berhasil dikirim.' };
  }
}
