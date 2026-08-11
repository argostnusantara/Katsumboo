import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getPromos() {
    return this.prisma.promo.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async createPromo(data: { title: string; subtitle: string; image?: string; isActive?: boolean }) {
    return this.prisma.promo.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        image: data.image || '',
        isActive: data.isActive ?? true,
      },
    });
  }

  async updatePromo(id: string, data: Partial<{ title: string; subtitle: string; image: string; isActive: boolean }>) {
    return this.prisma.promo.update({
      where: { id },
      data,
    });
  }

  async deletePromo(id: string) {
    await this.prisma.promo.delete({ where: { id } });
    return { message: 'Promo berhasil dihapus.' };
  }

  // Dashboard Stats calculation
  async getDashboardStats() {
    const totalUsers = await this.prisma.user.count({ where: { role: 'CUSTOMER' } });
    const totalOrders = await this.prisma.order.count();
    const completedOrders = await this.prisma.order.findMany({
      where: { status: 'Completed' },
    });
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.grandTotal, 0);

    return {
      totalUsers,
      totalOrders,
      totalRevenue,
    };
  }
}
