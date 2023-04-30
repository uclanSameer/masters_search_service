import { MenuResponse } from "./search-response";

export default interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  size?: number;
}
// Generated by https://quicktype.io

export interface SellerResponse {
  email:      string;
  isFeatured: boolean;
  userDetail: UserDetail;
  image?:      string;
}



export interface UserDetail {
  userId:      string;
  name:        string;
  phoneNumber: string;
  address:     string;
  city:        string;
  state:       string;
  country:     string;
  postalCode:  string;
  imageUrl:      string;
}

export interface ChefFullResponse {
  cheifDetails: SellerResponse;
  menuItems: Array<MenuResponse>;
  menuItemsCount: number;
  featuredItemsCount: number;
}
