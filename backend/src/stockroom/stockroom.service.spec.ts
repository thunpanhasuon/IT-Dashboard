import { Test, TestingModule } from '@nestjs/testing';
import { StockroomService } from './stockroom.service.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Stockroom } from './entities/stockroom.entity.js';

describe('StockroomService', () => {
  let service: StockroomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockroomService, { provide: getRepositoryToken(Stockroom), useValue: {} }],
    }).compile();

    service = module.get<StockroomService>(StockroomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
