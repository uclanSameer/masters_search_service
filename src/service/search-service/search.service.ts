import { Injectable } from '@nestjs/common';
import { ElasticClientConfig } from '../../config/ElasticClientConfig';
import { Client } from '@elastic/elasticsearch';
import {
  QueryDslQueryContainer,
  SearchResponse,
} from '@elastic/elasticsearch/lib/api/typesWithBodyKey';
import MenuSearchRequest from '../../dto/request';
import ApiResponse from '../../dto/response';

@Injectable()
export class SearchService {
  private readonly client: Client;

  constructor(elasticClientConfig: ElasticClientConfig) {
    this.client = elasticClientConfig.createClient();
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
    const search: SearchResponse = await this.client.search({
      index: 'menu',
      query: query,
    });
    const hits: Array<unknown> = search.hits.hits.map((hit) => hit._source);
    return {
      data: hits,
      message: 'success',
      status: 200,
    };
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
