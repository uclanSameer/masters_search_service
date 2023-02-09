export default interface SearchRequest {
  search?: string;
  isFeatured?: boolean;

  page?: number;

  size?: number;
}
