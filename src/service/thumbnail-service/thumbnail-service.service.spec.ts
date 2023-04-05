import { Test, TestingModule } from '@nestjs/testing';
import { ThumbnailServiceService } from './thumbnail-service.service';

describe('ThumbnailServiceService', () => {
  let service: ThumbnailServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ThumbnailServiceService],
    }).compile();

    service = module.get<ThumbnailServiceService>(ThumbnailServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
