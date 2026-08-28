import type { Product } from './product';

export interface HomeSectionProduct {
  id: string;
  homeSectionId: string;
  productId: string;
  createdAt?: string;
  updatedAt?: string;
  homeSection?: {
    id: string;
    title: string;
    desc?: string;
    tag?: string;
  };
  product?: Product & {
    category?: {
      id: string;
      name: string;
      slug?: string;
    };
  };
}

export interface HomeSection {
  id: string;
  title: string;
  desc: string;
  tag: string;
  createdAt: string;
  updatedAt: string;
  homeSectionProducts?: HomeSectionProduct[];
}

// Request Payloads for Home Sections
export interface CreateHomeSectionPayload {
  title: string;
  desc: string;
  tag: string;
  productIds?: string[];
}

export interface UpdateHomeSectionPayload {
  title?: string;
  desc?: string;
  tag?: string;
  productIds?: string[];
}

// Request Payloads for Home Section Products (/api/home-section-products)
export interface CreateHomeSectionProductPayload {
  homeSectionId: string;
  productId: string;
}

export interface UpdateHomeSectionProductPayload {
  productId: string;
}

// API Responses for Home Sections
export interface GetAllHomeSectionsResponse {
  success: boolean;
  count: number;
  data: HomeSection[];
}

export interface SingleHomeSectionResponse {
  success: boolean;
  message?: string;
  data: HomeSection;
}

export interface DeleteHomeSectionResponse {
  success: boolean;
  message: string;
}

// API Responses for Home Section Products
export interface GetAllHomeSectionProductsResponse {
  success: boolean;
  count?: number;
  data: HomeSectionProduct[];
}

export interface SingleHomeSectionProductResponse {
  success: boolean;
  message?: string;
  data: HomeSectionProduct;
}

export interface DeleteHomeSectionProductResponse {
  success: boolean;
  message: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
}
