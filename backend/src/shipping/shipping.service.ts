import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShippingService {
  private storeOpen = true;

  constructor(private prisma: PrismaService) {}

  async getStoreOpen() {
    return { storeOpen: this.storeOpen };
  }

  async setStoreOpen(isOpen: boolean) {
    this.storeOpen = isOpen;
    return { storeOpen: this.storeOpen };
  }

  async getCouriers() {
    return this.prisma.courier.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCourier(data: { name: string; phone: string; vehicleType: string; isActive?: boolean }) {
    return this.prisma.courier.create({
      data: {
        name: data.name,
        phone: data.phone,
        vehicleType: data.vehicleType,
        isActive: data.isActive ?? true,
      },
    });
  }

  async updateCourier(id: string, data: Partial<{ name: string; phone: string; vehicleType: string; isActive: boolean }>) {
    return this.prisma.courier.update({
      where: { id },
      data,
    });
  }

  async deleteCourier(id: string) {
    await this.prisma.courier.delete({ where: { id } });
    return { message: 'Kurir berhasil dihapus.' };
  }
}
