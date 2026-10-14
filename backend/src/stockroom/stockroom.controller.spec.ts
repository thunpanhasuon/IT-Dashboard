import { Test, TestingModule } from '@nestjs/testing';
import { StockroomController } from './stockroom.controller.js';
import { StockroomService } from './stockroom.service.js';

describe('StockroomController', () => {
  let controller: StockroomController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockroomController],
      providers: [{ provide: StockroomService, useValue: {} }],
    }).compile();

    controller = module.get<StockroomController>(StockroomController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
