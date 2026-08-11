import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) throw new NotFoundException('User tidak ditemukan.');
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.profile?.name,
      phone: user.profile?.phone,
      address: user.profile?.address,
      avatar: user.profile?.avatar,
    };
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string; address?: string; avatar?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan.');

    const profile = await this.prisma.profile.update({
      where: { userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.avatar !== undefined && { avatar: data.avatar }),
      },
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: profile.name,
      phone: profile.phone,
      address: profile.address,
      avatar: profile.avatar,
    };
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteUser(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });
    return { message: 'User berhasil dihapus.' };
  }
}
