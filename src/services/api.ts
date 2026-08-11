// src/services/api.ts
import type { Product, Order, Voucher, UserAccount, InboxMessage, Courier } from '../types';

const DB_KEY = 'katsumboo_local_db';
const DB_VERSION_KEY = 'katsumboo_db_version';
const CURRENT_DB_VERSION = '4';

// Version migration: on first load after version bump, clear dummy orders
const checkAndMigrate = () => {
  const storedVersion = localStorage.getItem(DB_VERSION_KEY);
  if (storedVersion !== CURRENT_DB_VERSION) {
    // Clear old dummy orders but keep users, products, settings
    const dbRaw = localStorage.getItem(DB_KEY);
    if (dbRaw) {
      try {
        const parsed = JSON.parse(dbRaw);
        // Remove known dummy order IDs
        const DUMMY_IDS = ['ORD-7391', 'ORD-8492', 'ORD-9201', 'ORD-9304'];
        parsed.orders = (parsed.orders || []).filter((o: any) => !DUMMY_IDS.includes(o.id));
        // Also clear demo inbox messages
        parsed.inbox = (parsed.inbox || []).filter((m: any) => m.userId !== 'usr-budi' && m.userId !== 'usr-sitir');
        localStorage.setItem(DB_KEY, JSON.stringify(parsed));
      } catch {}
    }
    localStorage.setItem(DB_VERSION_KEY, CURRENT_DB_VERSION);
  }
};
checkAndMigrate();

interface DBState {
  products: Product[];
  orders: Order[];
  vouchers: Voucher[];
  storeOpen: boolean;
  users: UserAccount[];
  inbox: InboxMessage[];
  couriers: Courier[];
  categories?: string[];
  promos?: any[];
}

const DEFAULT_CATEGORIES = ['Katsu Ayam', 'Minuman', 'Paket Hemat'];

const DEFAULT_PROMOS = [
  {
    id: 'p-1',
    title: 'PROMO MINGGU INI',
    subtitle: 'Makan Hemat Katsu Premium Khas Bandung! Dapatkan potongan harga khusus untuk setiap pembelian paket kombinasi Nasi Goreng Katsumboo + Minuman Segar via platform e-commerce lokal.',
    image: '',
    isActive: true
  },
  {
    id: 'p-2',
    title: 'DISKON AKHIR PEKAN',
    subtitle: 'Makan Puas Bertiga Rp 50.000! Nikmati Paket Puas Katsu Ayam bertiga dengan potongan harga spesial akhir pekan.',
    image: '',
    isActive: true
  },
  {
    id: 'p-3',
    title: 'MENU BARU: CHEESE CURRY Katsu',
    subtitle: 'Sensasi kuah kari Jepang kental dengan lelehan keju mozzarella di atas chicken katsu hangat yang krispi!',
    image: '',
    isActive: true
  }
];

const DEFAULT_CUSTOMIZATIONS = [
  { id: 'level-pedas', name: 'Level Pedas', options: ['Lvl 1', 'Lvl 2', 'Lvl 3', 'Lvl 4', 'Lvl 5'], required: true },
  { id: 'sambal', name: 'Sambal', options: ['Original', 'Ekstra Pedas', 'No Sambal'], required: true },
  { id: 'salad', name: 'Salad', options: ['Pakai Salad', 'No Salad'], required: true },
];

const DEFAULT_PRODUCTS: Product[] = [
  { id: "prod-1", name: "Nasi Goreng Katsumboo", desc: "Nasi goreng aromatik khas Indonesia dipadukan dengan chicken katsu tebal, saus premium Katsumboo, telur mata sapi, dan acar.", price: 25000, image: "/nasigoreng.png", category: "Katsu Ayam", isAvailable: true, customizations: DEFAULT_CUSTOMIZATIONS },
  { id: "prod-2", name: "Spaghetti Katsumboo", desc: "Spaghetti al dente dengan siraman saus khas Katsumboo yang gurih manis berpadu chicken katsu crispy.", price: 27000, image: "/spageti.png", category: "Katsu Ayam", isAvailable: true, customizations: DEFAULT_CUSTOMIZATIONS },
  { id: "prod-3", name: "Cheese Katsu Curry Rice", desc: "Chicken katsu dengan keju mozzarella leleh disajikan di atas nasi hangat dengan siraman kuah kari Jepang kental.", price: 32000, image: "/nasigoreng.png", category: "Katsu Ayam", isAvailable: true, customizations: DEFAULT_CUSTOMIZATIONS },
  { id: "prod-5", name: "Es Teh Manis Melati Jumbo", desc: "Teh manis segar aroma melati ukuran jumbo dingin pelepas dahaga.", price: 6000, image: "/logokatsu.jpg", category: "Minuman", isAvailable: true },
  { id: "prod-6", name: "Lemonade Katsumboo", desc: "Perasan lemon murni dingin berkarbonasi dengan daun mint segar dan es batu.", price: 10000, image: "/logokatsu.jpg", category: "Minuman", isAvailable: true },
  { id: "prod-7", name: "Paket Hemat Katsu Ayam", desc: "Nasi putih hangat + Chicken Katsu Original + Pilihan Saus + Es Teh Manis Jumbo.", price: 29000, image: "/nasigoreng.png", category: "Paket Hemat", isAvailable: true, customizations: DEFAULT_CUSTOMIZATIONS }
];

const now = new Date().toISOString();

const DEFAULT_VOUCHERS: Voucher[] = [
  {
    id: 'v-1',
    code: "KATSUMBOOBOOM",
    type: "fixed",
    value: 10000,
    minPurchase: 30000,
    description: "Potongan harga Rp 10.000 (Min. beli Rp 30.000)",
    maxUses: 100,
    usedByUserIds: [],
    sentToUserIds: [],
    createdAt: now
  },
  {
    id: 'v-2',
    code: "FREEONGKIR",
    type: "free_shipping",
    value: 12000,
    minPurchase: 25000,
    description: "Potongan ongkir s.d Rp 12.000 (Min. beli Rp 25.000)",
    maxUses: 50,
    usedByUserIds: [],
    sentToUserIds: [],
    createdAt: now
  },
  {
    id: 'v-welcome',
    code: "WELCOME5K",
    type: "fixed",
    value: 5000,
    minPurchase: 15000,
    description: "Voucher selamat datang! Diskon Rp 5.000 untuk pelanggan baru.",
    maxUses: 1,
    usedByUserIds: [],
    sentToUserIds: [],
    createdAt: now
  }
];

const DEFAULT_ORDERS: Order[] = [];

const DEFAULT_USERS: UserAccount[] = [
  { id: "usr-admin", name: "Owner Katsumboo", email: "admin@katsumboo.com", role: "admin", password: "admin123" },
  { id: "usr-cust", name: "Agus Bandung", email: "customer@katsumboo.com", phone: "08123456789", address: "Kost Orange Room 3, Jl. Ganesha No. 10, Coblong, Kota Bandung", role: "customer", password: "customer123" }
];

const DEFAULT_COURIERS: Courier[] = [
  { id: 'c-1', name: 'Kang Asep', phone: '0812-9988-7766', vehicleType: 'Motor', isActive: true },
  { id: 'c-2', name: 'Kang Cecep', phone: '0813-1122-3344', vehicleType: 'Motor', isActive: true },
  { id: 'c-3', name: 'Kang Ujang', phone: '0857-4433-2211', vehicleType: 'Motor', isActive: false },
];

const DEFAULT_INBOX: InboxMessage[] = [];

export const getDB = (): DBState => {
  const dbRaw = localStorage.getItem(DB_KEY);
  if (!dbRaw) {
    const defaultState: DBState = {
      products: DEFAULT_PRODUCTS,
      orders: DEFAULT_ORDERS,
      vouchers: DEFAULT_VOUCHERS,
      storeOpen: true,
      users: DEFAULT_USERS,
      inbox: DEFAULT_INBOX,
      couriers: DEFAULT_COURIERS,
      categories: DEFAULT_CATEGORIES,
      promos: DEFAULT_PROMOS
    };
    localStorage.setItem(DB_KEY, JSON.stringify(defaultState));
    return defaultState;
  }
  const parsed = JSON.parse(dbRaw) as DBState;
  // Migration: ensure inbox and couriers exist
  if (!parsed.inbox) parsed.inbox = DEFAULT_INBOX;
  if (!parsed.couriers) parsed.couriers = DEFAULT_COURIERS;
  if (!parsed.categories) parsed.categories = DEFAULT_CATEGORIES;
  if (!parsed.promos) parsed.promos = DEFAULT_PROMOS;
  
  // Migration: remove "Katsu Sapi" category and products
  if (parsed.categories && parsed.categories.includes('Katsu Sapi')) {
    parsed.categories = parsed.categories.filter(c => c !== 'Katsu Sapi');
    parsed.products = parsed.products.filter(p => p.category !== 'Katsu Sapi');
    localStorage.setItem(DB_KEY, JSON.stringify(parsed));
  }
  // Migration: ensure vouchers have new fields
  if (parsed.vouchers) {
    parsed.vouchers = parsed.vouchers.map((v: any) => ({
      id: v.id || `v-${v.code}`,
      usedByUserIds: v.usedByUserIds || [],
      sentToUserIds: v.sentToUserIds || [],
      maxUses: v.maxUses || 9999,
      createdAt: v.createdAt || now,
      ...v,
    }));
  }
  // Migration: ensure WELCOME5K voucher always exists
  if (parsed.vouchers && !parsed.vouchers.find((v: any) => v.code === 'WELCOME5K')) {
    parsed.vouchers.push({
      id: 'v-welcome',
      code: 'WELCOME5K',
      type: 'fixed',
      value: 5000,
      minPurchase: 15000,
      description: 'Voucher selamat datang! Diskon Rp 5.000 untuk pelanggan baru.',
      maxUses: 9999,
      usedByUserIds: [],
      sentToUserIds: [],
      createdAt: now,
    });
  }
  return parsed;
};

export const saveDB = (state: DBState): void => {
  localStorage.setItem(DB_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event('storage'));
};

export const apiService = {
  // Products
  getProducts: () => getDB().products,
  saveProducts: (products: Product[]) => {
    const db = getDB();
    db.products = products;
    saveDB(db);
  },

  // Orders
  getOrders: () => getDB().orders,
  saveOrders: (orders: Order[]) => {
    const db = getDB();
    db.orders = orders;
    saveDB(db);
  },
  addOrder: (order: Order) => {
    const db = getDB();
    db.orders.unshift(order);
    saveDB(db);
  },
  updateOrderStatus: (
    orderId: string,
    status: Order['status'],
    courierName?: string,
    courierPhone?: string
  ) => {
    const db = getDB();
    const ts = new Date().toISOString();
    db.orders = db.orders.map(o => {
      if (o.id === orderId) {
        const timestamps = { ...(o.statusTimestamps || {}) };
        if (status === 'Pending') timestamps.pending = ts;
        if (status === 'Cooking') timestamps.cooking = ts;
        if (status === 'Shipping') timestamps.shipping = ts;
        if (status === 'Completed') timestamps.completed = ts;
        return {
          ...o,
          status,
          statusTimestamps: timestamps,
          courierName: courierName || o.courierName,
          courierPhone: courierPhone || o.courierPhone,
          paymentStatus: status === 'Completed' ? 'Paid' : o.paymentStatus
        };
      }
      return o;
    });
    saveDB(db);
  },

  // Vouchers
  getVouchers: () => getDB().vouchers,
  addVoucher: (voucher: Voucher) => {
    const db = getDB();
    db.vouchers.push(voucher);
    saveDB(db);
  },
  updateVoucher: (voucherId: string, fields: Partial<Voucher>) => {
    const db = getDB();
    db.vouchers = db.vouchers.map(v => v.id === voucherId ? { ...v, ...fields } : v);
    saveDB(db);
  },
  deleteVoucher: (voucherId: string) => {
    const db = getDB();
    db.vouchers = db.vouchers.filter(v => v.id !== voucherId);
    saveDB(db);
  },
  markVoucherUsed: (code: string, userId: string) => {
    const db = getDB();
    db.vouchers = db.vouchers.map(v => {
      if (v.code.toUpperCase() === code.toUpperCase()) {
        return { ...v, usedByUserIds: [...(v.usedByUserIds || []), userId] };
      }
      return v;
    });
    saveDB(db);
  },

  // Store settings
  getStoreOpen: () => getDB().storeOpen,
  setStoreOpen: (isOpen: boolean) => {
    const db = getDB();
    db.storeOpen = isOpen;
    saveDB(db);
  },

  // Users
  getUsers: () => getDB().users,
  addUser: (user: UserAccount) => {
    const db = getDB();
    db.users.push(user);
    saveDB(db);
  },
  updateUser: (userId: string, updatedFields: Partial<UserAccount>) => {
    const db = getDB();
    db.users = db.users.map(u => {
      if (u.id === userId) return { ...u, ...updatedFields };
      return u;
    });
    saveDB(db);
  },

  // Inbox
  getInbox: (userId: string) => {
    const db = getDB();
    return db.inbox.filter(m => m.userId === userId || m.userId === 'all');
  },
  getAllInbox: () => getDB().inbox,
  addInboxMessage: (msg: InboxMessage) => {
    const db = getDB();
    db.inbox.unshift(msg);
    saveDB(db);
  },
  markInboxRead: (msgId: string) => {
    const db = getDB();
    db.inbox = db.inbox.map(m => m.id === msgId ? { ...m, isRead: true } : m);
    saveDB(db);
  },
  markAllInboxRead: (userId: string) => {
    const db = getDB();
    db.inbox = db.inbox.map(m =>
      (m.userId === userId || m.userId === 'all') ? { ...m, isRead: true } : m
    );
    saveDB(db);
  },
  getUnreadCount: (userId: string) => {
    const db = getDB();
    return db.inbox.filter(m => (m.userId === userId || m.userId === 'all') && !m.isRead).length;
  },

  // Couriers
  getCouriers: () => getDB().couriers,
  addCourier: (courier: Courier) => {
    const db = getDB();
    db.couriers.push(courier);
    saveDB(db);
  },
  updateCourier: (courierId: string, fields: Partial<Courier>) => {
    const db = getDB();
    db.couriers = db.couriers.map(c => c.id === courierId ? { ...c, ...fields } : c);
    saveDB(db);
  },
  deleteCourier: (courierId: string) => {
    const db = getDB();
    db.couriers = db.couriers.filter(c => c.id !== courierId);
    saveDB(db);
  },

  // Categories
  getCategories: () => getDB().categories || DEFAULT_CATEGORIES,
  saveCategories: (categories: string[]) => {
    const db = getDB();
    db.categories = categories;
    saveDB(db);
  },

  // Promos
  getPromos: () => getDB().promos || DEFAULT_PROMOS,
  savePromos: (promos: any[]) => {
    const db = getDB();
    db.promos = promos;
    saveDB(db);
  }
};
