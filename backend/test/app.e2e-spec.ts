import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('Help Desk API (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('serves the restored endpoints', async () => {
    await request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
    await request(app.getHttpServer()).get('/inventory').expect(200);
    await request(app.getHttpServer()).get('/assets').expect(200);
    await request(app.getHttpServer()).get('/stockroom').expect(200);
    await request(app.getHttpServer()).get('/tickets').expect(200);
  });
});
