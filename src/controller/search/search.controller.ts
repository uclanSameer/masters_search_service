import { Body, Controller, Get, Post } from '@nestjs/common';
import { SearchService } from '../../service/search-service/search.service';
import SearchRequest, { SellerSearchRequest } from '../../dto/request';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Post('menu')
  public search(@Body() search: SearchRequest) {
    return this.searchService.searchMenu(search);
  }

  @Post('menu/all')
  public all(@Body() search: SearchRequest) {
    return this.searchService.allMenu(search);
  }

  @Post('cheif')
  public cheifSearch(@Body() search: SellerSearchRequest) {
    return this.searchService.searchCheif(search);
  }
}
