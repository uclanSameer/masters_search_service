export default interface SearchRequest extends AllSearchRequest {
  search?: string;
}

export interface AllSearchRequest extends Pagination {
  isFeatured?: boolean;
}

export interface Pagination {
  page?: number;
  size?: number;
}

export interface SellerSearchRequest extends SearchRequest {
  location?: Location;
  postalCode?: string;
  radius?: number;
}

export interface Location{
  lat: number;
  lon: number;
}

