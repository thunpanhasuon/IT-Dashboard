import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto.js';
import { InventoryService } from './inventory.service.js';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  createInventoryItem(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.createInventoryItem(dto);
  }

  @Get()
  getInventory() {
    return this.inventoryService.getInventory();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.inventoryService.findOne(id);
  }
}
