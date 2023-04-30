import { Injectable } from '@nestjs/common';
import { ElasticClientConfig } from '../../config/ElasticClientConfig';
import { Client } from '@elastic/elasticsearch';
import {
  QueryDslQueryContainer,
  SearchHit,
  SearchResponse,
} from '@elastic/elasticsearch/lib/api/typesWithBodyKey';
import ApiResponse, { ChefFullResponse, SellerResponse } from '../../dto/response';
import { S3Service } from '../s3-service/s3.service';
import { MenuResponse } from '../../dto/search-response';
import { PostCodeService } from '../post-code/post-code.service';
import { SearchUtils } from 'src/utils/SearchUtils';
import { MenuSearchRequest, SellerSearchRequest, Location } from 'src/dto/request';
import { AggregationsAggregate } from '@elastic/elasticsearch/lib/api/types';

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
    const hits: Array<unknown> = await this.mapMenuResponse(search);
    return {
      data: hits,
      message: 'success',
      status: 200,
      size: hits.length,
    };
  }

  async searchMenu(request: MenuSearchRequest): Promise<ApiResponse<Array<MenuResponse>>> {
    const query = SearchUtils.createQueryForMenu(request);
    const size = request.size != null ? request.size : 10;
    const search: SearchResponse = await this.client.search<MenuResponse>({
      index: 'menu',
      query: query,
      size,
      from: ((request.page && request.page != null ? request.page : 1) - 1) * size,
    });
    const hits: Array<MenuResponse> = await this.mapMenuResponse(search);
    const total = typeof search.hits.total === 'number' ? search.hits.total : search.hits.total.value;
    return {
      data: hits,
      message: 'success',
      status: 200,
      size: total
    };
  }

  async searchCheif(sellerSearch: SellerSearchRequest): Promise<ApiResponse<unknown>> {
    if (!sellerSearch.location && sellerSearch.postalCode) {
      const location: Location = await this.postCodeService.getLocationFromPostCode(sellerSearch.postalCode);
      sellerSearch.location = location;
    }
    const query: QueryDslQueryContainer = SearchUtils.createQueryForSeller(sellerSearch);
    const search: SearchResponse = await this.client.search<SellerResponse>({
      index: 'seller',
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

  async findCheifById(id: string): Promise<ApiResponse<Array<SellerResponse>>> {
    const search: SearchResponse = await this.client.search<SellerResponse>({
      index: 'seller',
      query: {
        match: {
          id
        },
      },
    });
    const hits: Array<SellerResponse> = await this.mapSearchResponseForSeller(search);
    return {
      data: hits,
      message: 'success',
      status: 200,
      size: hits.length,
    };
  }


  async findCheifByEmail(email: string): Promise<ApiResponse<Array<SellerResponse>>> {
    const search: SearchResponse = await this.client.search<SellerResponse>({
      index: 'seller',
      query: {
        match: {
          email
        },
      },
    });
    const hits: Array<SellerResponse> = await this.mapSearchResponseForSeller(search);
    return {
      data: hits,
      message: 'success',
      status: 200,
      size: hits.length,
    };
  }

  public async cheifFullDetails(
    id: string,
  ): Promise<ApiResponse<ChefFullResponse>> {
    const cheifDetails = (await this.findCheifById(id)).data[0];
    return await this.getChefFullDetails(cheifDetails);
  }

  public async cheifFullDetailsByEmail(email: string): Promise<ApiResponse<ChefFullResponse>> {
    const cheifDetails = (await this.findCheifByEmail(email)).data[0];
    return await this.getChefFullDetails(cheifDetails);
  }


  private async getChefFullDetails(cheifDetails: SellerResponse) {
    const menuResponse = await this.searchMenu({
      email: cheifDetails.email,
    });

    const featuredItems = await this.searchMenu({
      email: cheifDetails.email,
      isFeatured: true,
      size: 0
    });
    const menuItems = menuResponse.data;
    return {
      data: {
        cheifDetails,
        menuItems,
        menuItemsCount: menuResponse.size,
        featuredItemsCount: featuredItems.size,
      },
      message: 'success',
      status: 200,
      size: 1
    };
  }

  async distinctCuisines(): Promise<ApiResponse<Array<string>>> {
    const search: SearchResponse = await this.client.search<SellerResponse>({
      index: 'seller',
      size: 0,
      aggs: {
        distinct_cuisines: {
          terms: {
            field: 'cuisines.keyword',
            size: 1000
          },
        },
      },
    });

    const result = search.aggregations.distinct_cuisines;
    const buckets: Array<{
      key: string;
      doc_count: number;
    }> = (result as any).buckets;
    const cuisines = buckets.map((bucket) => bucket.key);
    return {
      data: cuisines,
      message: 'success',
      status: 200,
      size: cuisines.length
    };
  }

  private async mapMenuResponse(search: SearchResponse) {
    return await Promise.all(
      search.hits.hits
        .map((hit: SearchHit<MenuResponse>) => hit._source)
        .map(async (menu: MenuResponse) => {
          const email = menu.businessEmail;
          const seller = await this.findCheifByEmail(email);
          if (seller.data.length > 0) {
            menu.businessName = seller.data[0].userDetail.name;
            menu.businessLocation = seller.data[0].userDetail.address;
          }
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
          const imageUrl = seller.userDetail.imageUrl;
          if (this.s3Service.checkIfFileExists(imageUrl)) {
            seller.image = await this.s3Service.getPresignedUrl(imageUrl);
          } else {
            seller.image = '';
          }
          return seller;
        })
    );
  }
}
