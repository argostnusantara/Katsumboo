import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── USERS ──────────────────────────────────────────────────────────────────
  const adminPass = await bcrypt.hash('admin123', 10);
  const customerPass = await bcrypt.hash('customer123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@katsumboo.com' },
    update: {},
    create: {
      email: 'admin@katsumboo.com',
      password: adminPass,
      role: 'ADMIN',
      profile: {
        create: {
          name: 'Admin Katsumboo',
          phone: '081234567890',
          address: 'Jl. Katsumboo No. 1, Bandung',
        },
      },
    },
  });
  console.log('✅ Admin created:', admin.email);

  const customer = await prisma.user.upsert({
    where: { email: 'customer@katsumboo.com' },
    update: {},
    create: {
      email: 'customer@katsumboo.com',
      password: customerPass,
      role: 'CUSTOMER',
      profile: {
        create: {
          name: 'Customer Demo',
          phone: '081234567891',
          address: 'Jl. Demo No. 2, Bandung',
        },
      },
    },
  });
  console.log('✅ Customer created:', customer.email);

  // ─── CATEGORIES ─────────────────────────────────────────────────────────────
  const categoryNames = ['Chicken Katsu', 'Rice Bowl', 'Minuman', 'Snack', 'Paket Hemat'];
  const createdCategories: Record<string, string> = {};

  for (const name of categoryNames) {
    const c = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    createdCategories[name] = c.id;
    console.log('✅ Category:', c.name);
  }

  // ─── PRODUCTS ───────────────────────────────────────────────────────────────
  const products = [
    {
      name: 'Chicken Katsu Original',
      desc: 'Ayam crispy klasik dengan saus katsu spesial, disajikan dengan nasi putih hangat.',
      price: 35000,
      image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400',
      category: 'Chicken Katsu',
      customizations: [
        { name: 'Level Kepedasan', options: ['Tidak Pedas', 'Pedas Sedang', 'Pedas Banget'] },
        { name: 'Tambahan', options: ['Telur Ceplok', 'Keju', 'Jamur'] },
      ],
    },
    {
      name: 'Chicken Katsu Spicy',
      desc: 'Versi pedas dari Chicken Katsu favorit kami dengan bumbu pedas menggugah selera.',
      price: 38000,
      image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400',
      category: 'Chicken Katsu',
      customizations: [
        { name: 'Level Kepedasan', options: ['Pedas Sedang', 'Pedas Banget', 'Super Pedas'] },
      ],
    },
    {
      name: 'Chicken Katsu Cheese',
      desc: 'Chicken Katsu dengan topping keju leleh yang melimpah.',
      price: 42000,
      image: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400',
      category: 'Chicken Katsu',
    },
    {
      name: 'Katsu Rice Bowl',
      desc: 'Potongan chicken katsu di atas nasi hangat dengan saus teriyaki dan taburan wijen.',
      price: 32000,
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
      category: 'Rice Bowl',
    },
    {
      name: 'Spicy Tuna Rice Bowl',
      desc: 'Rice bowl dengan tuna pedas segar, avokad, dan saus mayo sriracha.',
      price: 40000,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      category: 'Rice Bowl',
    },
    {
      name: 'Es Teh Manis',
      desc: 'Teh manis segar dengan es batu pilihan.',
      price: 8000,
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
      category: 'Minuman',
    },
    {
      name: 'Jus Jeruk Segar',
      desc: 'Jus jeruk peras segar tanpa tambahan gula.',
      price: 15000,
      image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
      category: 'Minuman',
    },
    {
      name: 'Matcha Latte',
      desc: 'Minuman matcha premium dengan susu segar. Tersedia panas maupun dingin.',
      price: 22000,
      image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400',
      category: 'Minuman',
    },
    {
      name: 'Kentang Goreng Crispy',
      desc: 'Kentang goreng crispy dengan bumbu spesial.',
      price: 18000,
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
      category: 'Snack',
    },
    {
      name: 'Paket Katsu Komplit',
      desc: 'Chicken Katsu Original + Nasi + Minuman pilihan + Kentang. Hemat dan kenyang!',
      price: 55000,
      image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400',
      category: 'Paket Hemat',
    },
  ];

  for (const p of products) {
    const slugId = `seed-${p.name.toLowerCase().replace(/\s+/g, '-')}`;
    await prisma.product.upsert({
      where: { id: slugId },
      update: { price: p.price, isAvailable: true },
      create: {
        id: slugId,
        name: p.name,
        desc: p.desc,
        price: p.price,
        image: p.image,
        categoryId: createdCategories[p.category],
        customizations: p.customizations ?? [],
        isAvailable: true,
      },
    });
    console.log('✅ Product:', p.name);
  }

  // ─── COUPONS ────────────────────────────────────────────────────────────────
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      type: 'percent',
      value: 10,
      minPurchase: 30000,
      description: 'Diskon 10% untuk pelanggan baru',
      maxUses: 1000,
    },
  });
  console.log('✅ Coupon: WELCOME10 (10% off)');

  await prisma.coupon.upsert({
    where: { code: 'KATSUMBOO5K' },
    update: {},
    create: {
      code: 'KATSUMBOO5K',
      type: 'fixed',
      value: 5000,
      minPurchase: 25000,
      description: 'Potongan Rp 5.000 untuk semua pesanan',
      maxUses: 500,
    },
  });
  console.log('✅ Coupon: KATSUMBOO5K (Rp 5.000 off)');

  // ─── COURIERS ────────────────────────────────────────────────────────────────
  const couriers = [
    { name: 'GoSend', phone: '08001234001', vehicleType: 'Motor', isActive: true },
    { name: 'GrabExpress', phone: '08001234002', vehicleType: 'Motor', isActive: true },
    { name: 'Kurir Toko', phone: '08001234003', vehicleType: 'Motor', isActive: true },
  ];

  for (const c of couriers) {
    const existing = await prisma.courier.findFirst({ where: { name: c.name } });
    if (!existing) {
      await prisma.courier.create({ data: c });
      console.log('✅ Courier:', c.name);
    }
  }

  console.log('\n🎉 Seeding selesai!');
  console.log('─────────────────────────────────────');
  console.log('Admin   : admin@katsumboo.com / admin123');
  console.log('Customer: customer@katsumboo.com / customer123');
  console.log('─────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
