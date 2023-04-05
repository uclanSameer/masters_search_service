export interface MenuResponse {
  name: string;
  description: string;
  cuisine: string;
  price: number;
  nutritionalInfo: string;
  image: string;
  isFeatured: boolean;
  sellerId: number;
  isAvailable?: boolean;
  isVeg?: boolean;
  instantDelivery?: boolean;
  bookingRequired?: boolean;
  businessEmail?: string;
  businessName?: string;
  businessLocation?: string;
}
