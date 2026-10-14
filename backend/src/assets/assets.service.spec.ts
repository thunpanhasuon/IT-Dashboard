import { Test, TestingModule } from '@nestjs/testing';
import { AssetsService } from './assets.service.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity.js';

describe('AssetsService', () => {
  let service: AssetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssetsService, { provide: getRepositoryToken(Asset), useValue: {} }],
    }).compile();

    service = module.get<AssetsService>(AssetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
