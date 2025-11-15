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
  name: 'DRIVER' | 'PUMP_ATTENDANT' | 'ADMIN' | 'OMC_ADMIN';
}

export interface Transaction {
  id: number;
  // New schema fields
  productCatalog?: { id: number; name: string; defaultPrice?: number };
  station?: { id: number; name: string };
  pumpAttendant?: { id: number; name: string; contact?: string | null };
  pump?: { id: number; pumpNumber: number | string };
  liters?: number | null;
  amount?: number | null;
  driverId?: number;
  token?: string;
  createdAt: string;
  deletedAt?: string;
  // Legacy fields (kept optional for compatibility)
  mobileNumber?: string;
  productId?: number;
  product?: Product;
  pumpAttendantId?: number;
  stationId?: number;
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