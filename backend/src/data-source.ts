import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Asset } from './assets/entities/asset.entity.js';
import { InventoryItem } from './inventory/entities/inventory-item.entity.js';
import { Stockroom } from './stockroom/entities/stockroom.entity.js';
import { Ticket } from './tickets/entities/ticket.entity.js';
import { User } from './auth/entities/user.entity.js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing');
}

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: (process.env.DATABASE_SSL ?? 'true') === 'true' ? { rejectUnauthorized: false } : false,
  entities: [Asset, InventoryItem, Stockroom, Ticket, User],
  migrations: [import.meta.dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});
