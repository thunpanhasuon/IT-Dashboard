import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAssetDto } from './dto/create-asset.dto.js';
import { Asset } from './entities/asset.entity.js';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetsRepository: Repository<Asset>,
  ) {}

  createAsset(dto: CreateAssetDto): Promise<Asset> {
    const asset = this.assetsRepository.create({
      name: dto.name,
      brand: dto.brand,
      model: dto.model,
      specs: dto.specs,
      assignedTo: dto.assignedTo ?? null,
      status: dto.status,
      location: dto.location,
    });
    return this.assetsRepository.save(asset);
  }

  getAssets(): Promise<Asset[]> {
    return this.assetsRepository.find();
  }

  async findOne(id: string): Promise<Asset> {
    const asset = await this.assetsRepository.findOneBy({ id });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return asset;
  }
}
