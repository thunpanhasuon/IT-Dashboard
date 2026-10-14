export type TicketStatus = 'open' | 'in_progress' | 'resolved';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
}

export interface Asset {
  id: string;
  name: string;
  brand: string;
  model: string;
  specs: string;
  assignedTo: string | null;
  status: string;
  location: string;
  lastUpdated: string;
}

export type InventoryStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  reorderLevel: number;
  unit: string;
  status: InventoryStatus;
  location: string;
  lastUpdated: string;
}

export interface StockItem {
  id: string;
  name: string;
  quantity: number;
}

export interface CreateTicketInput {
  title: string;
  description: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  name: string;
}

export type CreateAssetInput = Omit<Asset, 'id' | 'lastUpdated'>;
export type CreateInventoryInput = Omit<InventoryItem, 'id' | 'status' | 'lastUpdated'>;
export type CreateStockInput = Omit<StockItem, 'id'>;
