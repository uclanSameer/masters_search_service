import { Injectable } from '@nestjs/common';
import { ElasticClientConfig } from '../../config/ElasticClientConfig';
import { Client } from '@elastic/elasticsearch';
import {
  QueryDslQueryContainer,
  SearchHit,
  SearchResponse,
} from '@elastic/elasticsearch/lib/api/typesWithBodyKey';
import MenuSearchRequest from '../../dto/request';
import ApiResponse from '../../dto/response';
import { S3Service } from '../s3-service/s3.service';
import { MenuResponse } from '../../dto/search-response';

@Injectable()
export class SearchService {
  private readonly client: Client;

  constructor(
    private s3Service: S3Service,
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
    const query = this.createQuery(request);

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

  private createQuery(request: MenuSearchRequest) {
    const query: QueryDslQueryContainer = {
      bool: {
        should: [
          {
            match: {
              name: {
                query: request.search,
              },
            },
          },
          {
            match: {
              cuisine: {
                query: request.search,
              },
            },
          },
          {
            match: {
              description: {
                query: request.search,
              },
            },
          },
        ],
      },
    };
    return query;
  }
}
