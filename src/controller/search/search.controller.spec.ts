import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import ApiResponse from 'src/dto/response';

describe('SearchController', () => {
  let controller: SearchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        {
          provide: 'SearchService',
          useValue: {
            searchMenu: () => {
              return {
                data: [],
                message: 'success',
                status: 200,
              }
            },
          },
        }
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an ApiResponse', async () => {
    const response = await controller.search({
      search: 'test'
    });
    expect(response.status).toEqual(200);
  });

});
