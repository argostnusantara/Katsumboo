import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markRead(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({ where: { userId }, data: { isRead: true } });
    return { message: 'Semua notifikasi telah dibaca.' };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({ where: { userId, isRead: false } });
    return { count };
  }

  async create(userId: string, data: { type: string; title: string; body: string; voucherCode?: string }) {
    return this.prisma.notification.create({ data: { userId, ...data } });
  }

  async sendToAllUsers(data: { type: string; title: string; body: string }) {
    const users = await this.prisma.user.findMany({ where: { role: 'CUSTOMER' } });
    await this.prisma.notification.createMany({
      data: users.map(u => ({ userId: u.id, ...data })),
    });
    return { message: `Notifikasi dikirim ke ${users.length} pengguna.` };
  }
}
