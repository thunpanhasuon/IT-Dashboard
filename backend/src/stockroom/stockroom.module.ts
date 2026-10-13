import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockroomController } from './stockroom.controller.js';
import { StockroomService } from './stockroom.service.js';
import { Stockroom } from './entities/stockroom.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Stockroom])],
  controllers: [StockroomController],
  providers: [StockroomService],
})
export class StockroomModule {}
