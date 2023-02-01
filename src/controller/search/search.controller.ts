import { Body, Controller, Post } from '@nestjs/common';
import { SearchService } from '../../service/search-service/search.service';
import SearchRequest from '../../dto/request';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Post()
  public search(@Body() search: SearchRequest) {
    return this.searchService.searchMenu(search);
  }
}
