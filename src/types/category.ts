export interface Category {
  id: string;
  name: string;
  slug: string;
  desc?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  desc?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  desc?: string;
}

export interface GetAllCategoriesResponse {
  success: boolean;
  count?: number;
  data: Category[];
}

export interface SingleCategoryResponse {
  success: boolean;
  message?: string;
  data: Category;
}

export interface DeleteCategoryResponse {
  success: boolean;
  message?: string;
}
