export interface User {
  id: number;
  name: string | null;
  nationalId?: string | null;
  contact?: string | null;
  gender?: string | null;
  cardUrl?: string | null;
  email: string;
  roleId: number;
  role: Role;
  omcId?: number;
  stationId?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Role {
  id: number;
  name: 'DRIVER' | 'FUEL_ATTENDANT' | 'ADMIN' | 'OMC_ADMIN';
}

export interface Transaction {
  id: number;
  mobileNumber: string;
  productId: number;
  product: Product;
  liters: number;
  amount: number;
  pumpAttendantId: number;
  stationId: number;
  driverId?: number;
  token?: string;
  createdAt: string;
  deletedAt?: string;
}

export interface Product {
  id: number;
  type: string;
  liters: number;
  amount: number;
  stationId: number;
}

export interface Driver {
  id: number;
  userId?: number;
  ghanaCard: string;
  mobileNumber: string;
  vehicleCount: number;
}