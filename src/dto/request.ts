export default interface SearchRequest {
  search?: string;
  isFeatured?: boolean;

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

