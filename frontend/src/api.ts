import type { Asset, CreateAssetInput, CreateInventoryInput, CreateStockInput, CreateTicketInput, InventoryItem, StockItem, Ticket, TicketStatus, AuthSession, AuthUser, LoginInput } from './types';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';
let accessToken: string | null = null;

const setToken = (token: string | null) => {
  accessToken = token;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message || `Request failed with status ${response.status}`;
    if (response.status === 401 && accessToken) {
      accessToken = null;
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const api = {
  setToken,
  login: (input: LoginInput) =>
    request<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  getMe: () => request<AuthUser>('/auth/me'),

  getTickets: () => request<Ticket[]>('/tickets'),
  createTicket: (input: CreateTicketInput) =>
    request<Ticket>('/tickets', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateTicketStatus: (id: string, status: TicketStatus) =>
    request<Ticket>(`/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getAssets: () => request<Asset[]>('/assets'),
  createAsset: (input: CreateAssetInput) => request<Asset>('/assets', { method: 'POST', body: JSON.stringify(input) }),

  getInventory: () => request<InventoryItem[]>('/inventory'),
  createInventoryItem: (input: CreateInventoryInput) =>
    request<InventoryItem>('/inventory', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  getStockroom: () => request<StockItem[]>('/stockroom'),
  createStockItem: (input: CreateStockInput) =>
    request<StockItem>('/stockroom', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};
