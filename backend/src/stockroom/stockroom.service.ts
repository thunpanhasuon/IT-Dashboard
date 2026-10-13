import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stockroom } from './entities/stockroom.entity.js';
import { CreateStockroomDto } from './dto/create-stockroom.dto.js';

@Injectable()
export class StockroomService {
  constructor(
    @InjectRepository(Stockroom)
    private readonly stockroomRepository: Repository<Stockroom>,
  ) {}

  createStock(stockDto: CreateStockroomDto): Promise<Stockroom> {
    const stock = this.stockroomRepository.create({
      name: stockDto.name,
      quantity: stockDto.quantity,
    });
    return this.stockroomRepository.save(stock);
  }

  getStock(): Promise<Stockroom[]> {
    return this.stockroomRepository.find();
  }

  async findOne(id: string): Promise<Stockroom> {
    const stock = await this.stockroomRepository.findOneBy({ id });

    if (!stock) {
      throw new NotFoundException(`Stockroom item with ID ${id} not found`);
    }

    return stock;
  }
}
