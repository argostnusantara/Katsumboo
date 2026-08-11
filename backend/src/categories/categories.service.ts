import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async create(name: string) {
    // Check if category name already exists
    const existing = await this.prisma.category.findUnique({ where: { name } });
    if (existing) return existing;
    return this.prisma.category.create({ data: { name } });
  }

  async delete(idOrName: string) {
    // Find category either by UUID id or by name
    const existing = await this.prisma.category.findFirst({
      where: {
        OR: [
          { id: idOrName },
          { name: idOrName }
        ]
      }
    });

    if (!existing) {
      // Return gracefully if category was already removed
      return { message: 'Kategori sudah tidak ada atau telah dihapus.' };
    }

    await this.prisma.category.delete({
      where: { id: existing.id }
    });

    return { message: 'Kategori berhasil dihapus.' };
  }
}
