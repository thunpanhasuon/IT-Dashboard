import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CreateStockroomDto } from './dto/create-stockroom.dto.js';
import { StockroomService } from './stockroom.service.js';

@Controller('stockroom')
export class StockroomController {
  constructor(private readonly stockroomService: StockroomService) {}

  @Post()
  createStock(@Body() dto: CreateStockroomDto) {
    return this.stockroomService.createStock(dto);
  }

  @Get()
  getStock() {
    return this.stockroomService.getStock();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.stockroomService.findOne(id);
  }
}
