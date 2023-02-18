import { Test, TestingModule } from '@nestjs/testing';
import { PostCodeService } from './post-code.service';

describe('PostCodeService', () => {
  let service: PostCodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostCodeService],
    }).compile();

    service = module.get<PostCodeService>(PostCodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
