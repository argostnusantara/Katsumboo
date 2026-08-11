// src/types/menu.ts

export interface MenuCustomization {
  id: string;
  name: string; // e.g. "Sambal", "Salad"
  options: string[]; // e.g. ["Original", "Ekstra", "No Sambal"]
  required: boolean;
}

export interface Product {
  id: string;
  name: string;
  desc: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  customizations?: MenuCustomization[];
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  image: string; // Base64 or Preset image URL
  isActive: boolean;
}