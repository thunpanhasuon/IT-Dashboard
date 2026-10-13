import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto.js';
import {
  InventoryItem,
  InventoryStatus,
} from './entities/inventory-item.entity.js';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly inventoryRepository: Repository<InventoryItem>,
  ) {}

  createInventoryItem(dto: CreateInventoryItemDto): Promise<InventoryItem> {
    const status =
      dto.quantity === 0
        ? InventoryStatus.OUT_OF_STOCK
        : dto.quantity <= dto.reorderLevel
          ? InventoryStatus.LOW_STOCK
          : InventoryStatus.IN_STOCK;
    const inventoryItem = this.inventoryRepository.create({ ...dto, status });
    return this.inventoryRepository.save(inventoryItem);
  }

  getInventory(): Promise<InventoryItem[]> {
    return this.inventoryRepository.find();
  }

  async findOne(id: string): Promise<InventoryItem> {
    const inventoryItem = await this.inventoryRepository.findOneBy({ id });

    if (!inventoryItem) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    return inventoryItem;
  }
}
