// src/types/courier.ts

export interface Courier {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'Motor' | 'Sepeda' | 'Mobil';
  isActive: boolean;
}
