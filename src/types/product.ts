import type { Category } from './category';

export interface ProductPlan {
  id?: string;
  name?: string;
  title?: string;
  price: number;
  durationDays?: number;
  validity?: string;
}

export interface ProductCategoryRef {
  id: string;
  name: string;
  slug: string;
  desc?: string | null;
}

export interface Product {
  id: string;
  name: string;
  imgUrl?: string | null;
  smallDesc?: string | null;
  categoryId: string;
  stock: boolean;
  type?: string[];
  plans?: ProductPlan[];
  longDesc?: string | null;
  features?: string[];
  createdAt?: string;
  updatedAt?: string;
  category?: ProductCategoryRef | Category;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetAllProductsQuery {
  page?: number;
  limit?: number;
  categoryId?: string;
  stock?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetAllProductsResponse {
  success: boolean;
  data: Product[];
  pagination?: PaginationMeta;
}

export interface SingleProductResponse {
  success: boolean;
  message?: string;
  data: Product;
}

export interface DeleteProductResponse {
  success: boolean;
  message?: string;
}

export interface CreateProductPayload {
  name: string;
  imgUrl?: string;
  smallDesc?: string;
  categoryId: string;
  stock?: boolean;
  type?: string[];
  plans?: ProductPlan[];
  longDesc?: string;
  features?: string[];
}

export interface UpdateProductPayload {
  name?: string;
  imgUrl?: string;
  smallDesc?: string;
  categoryId?: string;
  stock?: boolean;
  type?: string[];
  plans?: ProductPlan[];
  longDesc?: string;
  features?: string[];
}
