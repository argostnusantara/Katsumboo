import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async getAll(categoryId?: string) {
    return this.prisma.product.findMany({
      where: { ...(categoryId && { categoryId }) },
      include: { category: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Produk tidak ditemukan.');
    return product;
  }

  async create(data: {
    name: string; desc: string; price: number; image: string;
    categoryId: string; isAvailable?: boolean; customizations?: any;
  }) {
    return this.prisma.product.create({ data: { ...data }, include: { category: true } });
  }

  async update(id: string, data: Partial<{
    name: string; desc: string; price: number; image: string;
    categoryId: string; isAvailable: boolean; customizations: any;
  }>) {
    await this.getById(id);
    return this.prisma.product.update({ where: { id }, data, include: { category: true } });
  }

  async delete(id: string) {
    await this.getById(id);
    // Nullify productId in OrderItems first to avoid FK constraint issues
    await this.prisma.orderItem.updateMany({
      where: { productId: id },
      data: { productId: null },
    });
    await this.prisma.product.delete({ where: { id } });
    return { message: 'Produk berhasil dihapus.' };
  }
}
