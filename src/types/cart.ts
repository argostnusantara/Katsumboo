// src/types/cart.ts
import type { Product } from './menu';

export interface CartItem extends Product {
  quantity: number;
  selectedSauce?: string;
  levelPedas?: number;
  notes?: string;
  selectedCustomizations?: Record<string, string>; // customizationId -> selectedOption
}