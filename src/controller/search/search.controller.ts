import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
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

  @Get('cheif/:id')
  public findbyId(@Param('id') id: string) {
    return this.searchService.findCheifById(id);
  }

  @Get('chef/details')
  public sellerSearch(@Query('id') id?: string, @Query('email') email?: string) {
    console.log(id, email);
    if (id) {
      return this.searchService.cheifFullDetails(id);
    } else if (email) {
      return this.searchService.cheifFullDetailsByEmail(email);
    }
  }

  @Get('cuisines')
  public cuisines() {
    return this.searchService.distinctCuisines();
  }
}
