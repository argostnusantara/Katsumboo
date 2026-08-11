import { apiClient } from './apiClient';
import type { Product } from '../types';

// ─── Category object with id and name ─────────────────────────────────────────
export interface CategoryObj { id: string; name: string; }

export const menuService = {
  getProducts: async (): Promise<Product[]> => {
    const data: any = await apiClient.get('/products');
    if (!Array.isArray(data)) return [];
    return data.map((p: any) => ({
      ...p,
      category: typeof p.category === 'object' && p.category !== null ? (p.category.name || '') : String(p.category || ''),
    }));
  },

  updateProduct: async (product: Product): Promise<Product> => {
    // Backend needs categoryId (UUID), not category name string.
    const payload: any = {
      name: product.name,
      desc: product.desc,
      price: product.price,
      image: product.image,
      isAvailable: product.isAvailable,
      customizations: product.customizations ?? [],
    };
    return apiClient.put(`/products/${product.id}`, payload);
  },

  updateProductWithCategory: async (product: Product, categoryId: string): Promise<Product> => {
    const payload: any = {
      name: product.name,
      desc: product.desc,
      price: product.price,
      image: product.image,
      isAvailable: product.isAvailable,
      customizations: product.customizations ?? [],
      categoryId,
    };
    return apiClient.put(`/products/${product.id}`, payload);
  },

  toggleAvailability: async (productId: string, isAvailable: boolean): Promise<void> => {
    await apiClient.patch(`/products/${productId}/availability`, { isAvailable });
  },

  createProduct: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    return apiClient.post('/products', productData);
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    await apiClient.delete(`/products/${id}`);
    return true;
  },

  getStoreOpen: async (): Promise<boolean> => {
    const data: any = await apiClient.get('/shipping/store-status');
    return Boolean(data?.storeOpen ?? true);
  },

  setStoreOpen: async (isOpen: boolean): Promise<boolean> => {
    const data: any = await apiClient.post('/shipping/store-status', { storeOpen: isOpen });
    return Boolean(data?.storeOpen ?? isOpen);
  },

  // Returns full category objects with id + name
  getCategoryObjects: async (): Promise<CategoryObj[]> => {
    const list: any = await apiClient.get('/categories');
    if (!Array.isArray(list)) return [];
    return list.map((c: any) => ({
      id: c?.id || c,
      name: typeof c === 'string' ? c : (c?.name || String(c)),
    }));
  },

  deleteCategory: async (id: string): Promise<boolean> => {
    await apiClient.delete(`/categories/${id}`);
    return true;
  },

  getCategories: async (): Promise<string[]> => {
    const list: any = await apiClient.get('/categories');
    if (!Array.isArray(list)) return [];
    return list.map((c: any) => typeof c === 'string' ? c : (c?.name || String(c)));
  },

  saveCategories: async (categories: (string | CategoryObj)[]): Promise<void> => {
    const existing: any = await apiClient.get('/categories');
    const existingNames = Array.isArray(existing) ? existing.map((c: any) => c?.name || String(c)) : [];

    for (const cat of categories) {
      const catName = typeof cat === 'string' ? cat.trim() : (cat?.name || '').trim();
      if (catName && !existingNames.includes(catName)) {
        await apiClient.post('/categories', { name: catName });
      }
    }
  },

  getPromos: async (): Promise<any[]> => {
    return apiClient.get('/admin/promos');
  },

  savePromos: async (promos: any[]): Promise<void> => {
    for (const promo of promos) {
      if (promo.id.startsWith('promo-') || promo.id.startsWith('p-')) {
        await apiClient.post('/admin/promos', {
          title: promo.title,
          subtitle: promo.subtitle,
          image: promo.image,
          isActive: promo.isActive,
        });
      } else {
        await apiClient.put(`/admin/promos/${promo.id}`, promo);
      }
    }
  }
};