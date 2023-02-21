import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";
import SearchRequest, { SellerSearchRequest } from "src/dto/request";

export class SearchUtils {

    constructor() {
        throw new Error('This is a static class');
     }
    
    public static createQueryFroMenu(request: SearchRequest) {
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

      public static createQueryForSeller(request: SellerSearchRequest) {
        let query: QueryDslQueryContainer = {
          bool: {

          }
        };
        if(request.search){
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
          query.bool.filter = [
            {
              geo_distance: {
                distance: request.radius + 'km',
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
        return query;
      }
}