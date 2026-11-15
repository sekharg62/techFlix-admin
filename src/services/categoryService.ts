import axios from 'axios';
import { API_URL } from './apiClient';
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  GetAllCategoriesResponse,
  SingleCategoryResponse,
  DeleteCategoryResponse,
} from '../types/category';

const API_BASE_URL = `${API_URL}/categories`;

export const categoryService = {
  // Fetch all categories (GET /api/categories)
  getAllCategories: async (): Promise<Category[]> => {
    const res = await axios.get<GetAllCategoriesResponse>(API_BASE_URL);
    return res.data.data;
  },

  // Fetch category by ID (GET /api/categories/:id)
  getCategoryById: async (id: string): Promise<Category> => {
    const res = await axios.get<SingleCategoryResponse>(`${API_BASE_URL}/${id}`);
    return res.data.data;
  },

  // Create a new category (POST /api/categories)
  createCategory: async (payload: CreateCategoryPayload): Promise<Category> => {
    const res = await axios.post<SingleCategoryResponse>(API_BASE_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res.data.data;
  },

  // Update category by ID (PUT / PATCH /api/categories/:id)
  updateCategory: async (id: string, payload: UpdateCategoryPayload): Promise<Category> => {
    const res = await axios.put<SingleCategoryResponse>(`${API_BASE_URL}/${id}`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res.data.data;
  },

  // Delete category by ID (DELETE /api/categories/:id)
  deleteCategory: async (id: string): Promise<void> => {
    await axios.delete<DeleteCategoryResponse>(`${API_BASE_URL}/${id}`);
  },
};

export default categoryService;
