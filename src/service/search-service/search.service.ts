import { Injectable } from '@nestjs/common';
import { ElasticClientConfig } from '../../config/ElasticClientConfig';
import { Client } from '@elastic/elasticsearch';
import {
  QueryDslQueryContainer,
  SearchHit,
  SearchResponse,
} from '@elastic/elasticsearch/lib/api/typesWithBodyKey';
import MenuSearchRequest, { AllSearchRequest, Location, Pagination, SellerSearchRequest } from '../../dto/request';
import ApiResponse, { SellerResponse } from '../../dto/response';
import { S3Service } from '../s3-service/s3.service';
import { MenuResponse } from '../../dto/search-response';
import { PostCodeService } from '../post-code/post-code.service';
import { SearchUtils } from 'src/utils/SearchUtils';

@Injectable()
export class SearchService {
  private readonly client: Client;

  constructor(
    private s3Service: S3Service,
    private postCodeService: PostCodeService,
    elasticClientConfig: ElasticClientConfig,
  ) {
    this.client = elasticClientConfig.createClient();
  }

  public async allMenu(
    request: MenuSearchRequest,
  ): Promise<ApiResponse<unknown>> {
    const search: SearchResponse = await this.client.search<MenuResponse>({
      index: 'menu',
      from: ((request.page != null ? request.page : 1) - 1) * request.size,
      size: request.size != null ? request.size : 10,
    });
    const hits: Array<unknown> = await this.mapSearchResponse(search);
    return {
      data: hits,
      message: 'success',
      status: 200,
      size: hits.length,
    };
  }

  async searchMenu(request: MenuSearchRequest): Promise<ApiResponse<unknown>> {
    const query = SearchUtils.createQueryFroMenu(request);

    if (request.isFeatured !== undefined) {
      query.bool.must = [
        {
          match: {
            isFeatured: {
              query: request.isFeatured,
            },
          },
        },
      ];
    }
    const search: SearchResponse = await this.client.search<MenuResponse>({
      index: 'menu',
      query: query,
    });
    const hits: Array<unknown> = await this.mapSearchResponse(search);
    return {
      data: hits,
      message: 'success',
      status: 200,
      size: hits.length,
    };
  }

  async searchCheif(sellerSearch: SellerSearchRequest): Promise<ApiResponse<unknown>> {
    if(!sellerSearch.location && sellerSearch.postalCode) {
      const location: Location = await this.postCodeService.getLocationFromPostCode(sellerSearch.postalCode);
      sellerSearch.location = location;
    }
    const query = SearchUtils.createQueryForSeller(sellerSearch);
    const search: SearchResponse = await this.client.search<SellerResponse>({
      index: 'seller_temp',
      query: query,
      size: sellerSearch.size != null ? sellerSearch.size : 10,
      from: ((sellerSearch.page != null ? sellerSearch.page : 1) - 1) * sellerSearch.size,
    })
    const hits: Array<unknown> = await this.mapSearchResponseForSeller(search);
    return {
      data: hits,
      message: 'success',
      status: 200,
      size: hits.length,
    };
  }

  private async mapSearchResponse(search: SearchResponse) {
    return await Promise.all(
      search.hits.hits
        .map((hit: SearchHit<MenuResponse>) => hit._source)
        .map(async (menu: MenuResponse) => {
          menu.image = await this.s3Service.getPresignedUrl(menu.image);
          return menu;
        }),
    );
  }

  private async mapSearchResponseForSeller(search: SearchResponse) {
    return await Promise.all(
      search.hits.hits
        .map((hit: SearchHit<SellerResponse>) => hit._source)
        .map(async (seller: SellerResponse) => {
          const imageUrl = `image/${seller.userDetail.userId}/profile/${seller.userDetail.name}`;
          if(this.s3Service.checkIfFileExists(imageUrl)){
            seller.image = await this.s3Service.getPresignedUrl(imageUrl);
          }else{
            seller.image = '';
          }
          return seller;
        })
    );
  }
}
