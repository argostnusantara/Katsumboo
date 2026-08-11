import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    await this.seedIfNeeded();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async seedIfNeeded() {
    // 1. Categories
    const categoryCount = await this.category.count();
    if (categoryCount === 0) {
      await this.category.createMany({
        data: [
          { name: 'Katsu Ayam' },
          { name: 'Minuman' },
          { name: 'Paket Hemat' },
        ],
      });
    }

    const categories = await this.category.findMany();
    const getCatId = (name: string) => categories.find((c) => c.name === name)?.id || '';

    // 2. Products
    const productCount = await this.product.count();
    if (productCount === 0) {
      const defaultCustomizations = [
        { id: 'level-pedas', name: 'Level Pedas', options: ['Lvl 1', 'Lvl 2', 'Lvl 3', 'Lvl 4', 'Lvl 5'], required: true },
        { id: 'sambal', name: 'Sambal', options: ['Original', 'Ekstra Pedas', 'No Sambal'], required: true },
        { id: 'salad', name: 'Salad', options: ['Pakai Salad', 'No Salad'], required: true },
      ];

      await this.product.create({
        data: {
          name: 'Nasi Goreng Katsumboo',
          desc: 'Nasi goreng aromatik khas Indonesia dipadukan dengan chicken katsu tebal, saus premium Katsumboo, telur mata sapi, dan acar.',
          price: 25000,
          image: '/nasigoreng.png',
          categoryId: getCatId('Katsu Ayam'),
          isAvailable: true,
          customizations: defaultCustomizations as any,
        },
      });

      await this.product.create({
        data: {
          name: 'Spaghetti Katsumboo',
          desc: 'Spaghetti al dente dengan siraman saus khas Katsumboo yang gurih manis berpadu chicken katsu crispy.',
          price: 27000,
          image: '/spageti.png',
          categoryId: getCatId('Katsu Ayam'),
          isAvailable: true,
          customizations: defaultCustomizations as any,
        },
      });

      await this.product.create({
        data: {
          name: 'Cheese Katsu Curry Rice',
          desc: 'Chicken katsu dengan keju mozzarella leleh disajikan di atas nasi hangat dengan siraman kuah kari Jepang kental.',
          price: 32000,
          image: '/nasigoreng.png',
          categoryId: getCatId('Katsu Ayam'),
          isAvailable: true,
          customizations: defaultCustomizations as any,
        },
      });

      await this.product.create({
        data: {
          name: 'Es Teh Manis Melati Jumbo',
          desc: 'Teh manis segar aroma melati ukuran jumbo dingin pelepas dahaga.',
          price: 6000,
          image: '/logokatsu.jpg',
          categoryId: getCatId('Minuman'),
          isAvailable: true,
        },
      });

      await this.product.create({
        data: {
          name: 'Lemonade Katsumboo',
          desc: 'Perasan lemon murni dingin berkarbonasi dengan daun mint segar dan es batu.',
          price: 10000,
          image: '/logokatsu.jpg',
          categoryId: getCatId('Minuman'),
          isAvailable: true,
        },
      });

      await this.product.create({
        data: {
          name: 'Paket Hemat Katsu Ayam',
          desc: 'Nasi putih hangat + Chicken Katsu Original + Pilihan Saus + Es Teh Manis Jumbo.',
          price: 29000,
          image: '/nasigoreng.png',
          categoryId: getCatId('Paket Hemat'),
          isAvailable: true,
          customizations: defaultCustomizations as any,
        },
      });
    }

    // 3. Coupons
    const couponCount = await this.coupon.count();
    if (couponCount === 0) {
      await this.coupon.createMany({
        data: [
          {
            code: 'KATSUMBOOBOOM',
            type: 'fixed',
            value: 10000,
            minPurchase: 30000,
            description: 'Potongan harga Rp 10.000 (Min. beli Rp 30.000)',
            maxUses: 100,
            usedByUserIds: [],
            sentToUserIds: [],
          },
          {
            code: 'FREEONGKIR',
            type: 'free_shipping',
            value: 12000,
            minPurchase: 25000,
            description: 'Potongan ongkir s.d Rp 12.000 (Min. beli Rp 25.000)',
            maxUses: 50,
            usedByUserIds: [],
            sentToUserIds: [],
          },
          {
            code: 'WELCOME5K',
            type: 'fixed',
            value: 5000,
            minPurchase: 15000,
            description: 'Voucher selamat datang! Diskon Rp 5.000 untuk pelanggan baru.',
            maxUses: 99999, // Allow multiple new users to claim it
            usedByUserIds: [],
            sentToUserIds: [],
          },
        ],
      });
    }

    // 4. Couriers
    const courierCount = await this.courier.count();
    if (courierCount === 0) {
      await this.courier.createMany({
        data: [
          { name: 'Kang Asep', phone: '0812-9988-7766', vehicleType: 'Motor', isActive: true },
          { name: 'Kang Cecep', phone: '0813-1122-3344', vehicleType: 'Motor', isActive: true },
          { name: 'Kang Ujang', phone: '0857-4433-2211', vehicleType: 'Motor', isActive: false },
        ],
      });
    }

    // 5. Promos
    const promoCount = await this.promo.count();
    if (promoCount === 0) {
      await this.promo.createMany({
        data: [
          {
            title: 'PROMO MINGGU INI',
            subtitle: 'Makan Hemat Katsu Premium Khas Bandung! Dapatkan potongan harga khusus untuk setiap pembelian paket kombinasi Nasi Goreng Katsumboo + Minuman Segar.',
            image: '',
            isActive: true,
          },
          {
            title: 'DISKON AKHIR PEKAN',
            subtitle: 'Makan Puas Bertiga Rp 50.000! Nikmati Paket Puas Katsu Ayam bertiga dengan potongan harga spesial akhir pekan.',
            image: '',
            isActive: true,
          },
          {
            title: 'MENU BARU: CHEESE CURRY Katsu',
            subtitle: 'Sensasi kuah kari Jepang kental dengan lelehan keju mozzarella di atas chicken katsu hangat yang krispi!',
            image: '',
            isActive: true,
          },
        ],
      });
    }

    // 6. Users
    const userCount = await this.user.count();
    if (userCount === 0) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      const customerPassword = await bcrypt.hash('customer123', 10);

      // Create Admin
      await this.user.create({
        data: {
          email: 'admin@katsumboo.com',
          password: adminPassword,
          role: 'ADMIN',
          profile: {
            create: {
              name: 'Owner Katsumboo',
              phone: '08123456780',
              address: 'Bandung',
            },
          },
        },
      });

      // Create Customer
      await this.user.create({
        data: {
          email: 'customer@katsumboo.com',
          password: customerPassword,
          role: 'CUSTOMER',
          profile: {
            create: {
              name: 'Agus Bandung',
              phone: '08123456789',
              address: 'Kost Orange Room 3, Jl. Ganesha No. 10, Coblong, Kota Bandung',
            },
          },
        },
      });
    }
  }
}
