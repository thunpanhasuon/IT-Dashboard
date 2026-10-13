import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetsController } from './assets.controller.js';
import { AssetsService } from './assets.service.js';
import { Asset } from './entities/asset.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Asset])],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
