import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum InventoryStatus {
  IN_STOCK = 'In Stock',
  LOW_STOCK = 'Low Stock',
  OUT_OF_STOCK = 'Out of Stock',
}

@Entity('inventory')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 100 })
  category!: string;

  @Column({ type: 'int', default: 0 })
  quantity!: number;

  @Column({ type: 'int', default: 0 })
  reorderLevel!: number;

  @Column({ type: 'varchar', length: 50 })
  unit!: string;

  @Column({
    type: 'enum',
    enum: InventoryStatus,
    default: InventoryStatus.OUT_OF_STOCK,
  })
  status!: InventoryStatus;

  @Column({ type: 'varchar', length: 200 })
  location!: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  lastUpdated!: Date;
}
