import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";
import SearchRequest, { MenuSearchRequest, SellerSearchRequest } from "src/dto/request";

export class SearchUtils {

  constructor() {
    throw new Error('This is a static class');
  }

  public static createQueryFroMenu(request: MenuSearchRequest) {
    let query: QueryDslQueryContainer = {
      bool: {}
    }
    if (request.search) {
      query = {
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
    }

    if (request.email) {
      query.bool.must = [
        {
          match: {
            businessEmail: {
              query: request.email,
            },
          },
        },
      ];
    }
    return query;
  }

  public static createQueryForSeller(request: SellerSearchRequest): QueryDslQueryContainer {
    let query: QueryDslQueryContainer = {
      bool: {

      }
    };
    if (request.search) {
      query.bool.should = [
        {
          match: {
            'userDetail.name': {
              query: request.search,
            },
          },
        }
      ];
    }

    if (request.location) {
      const radius = request.radius || 5;
      query.bool.filter = [
        {
          geo_distance: {
            distance: radius + 'km',
            location: {
              lat: request.location.lat,
              lon: request.location.lon,
            },
          },
        },
      ];
    }

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

    if (request.search) {
      query.bool.should = [
        {
          match: {
            'userDetail.name': {
              query: request.search,
            }
          }
        }
      ]
    }
    return query;
  }
}