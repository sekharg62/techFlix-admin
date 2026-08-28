import axios from 'axios';
import type {
  Product,
  GetAllProductsQuery,
  GetAllProductsResponse,
  SingleProductResponse,
  CreateProductPayload,
  UpdateProductPayload,
  DeleteProductResponse,
} from '../types/product';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products`;

// Helper to retrieve auth token
const getAuthHeaders = () => {
  try {
    const saved = localStorage.getItem('techflix_admin_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.token) {
        return {
          Authorization: `Bearer ${parsed.token}`,
        };
      }
    }
  } catch (e) {
    console.warn('Could not read user auth token from localStorage', e);
  }
  return {};
};

export const productService = {
  // Fetch all products with query parameters (pagination, category filter, stock, search)
  getAllProducts: async (params?: GetAllProductsQuery): Promise<GetAllProductsResponse> => {
    const res = await axios.get<GetAllProductsResponse>(API_BASE_URL, {
      headers: {
        ...getAuthHeaders(),
      },
      params,
    });
    return res.data;
  },

  // Fetch a single product by ID
  getProductById: async (id: string): Promise<Product> => {
    const res = await axios.get<SingleProductResponse>(`${API_BASE_URL}/${id}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    return res.data.data;
  },

  // Create a new product under a category
  createProduct: async (payload: CreateProductPayload): Promise<Product> => {
    const res = await axios.post<SingleProductResponse>(API_BASE_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    return res.data.data;
  },

  // Update an existing product by ID (PUT / PATCH)
  updateProduct: async (id: string, payload: UpdateProductPayload): Promise<Product> => {
    const res = await axios.put<SingleProductResponse>(`${API_BASE_URL}/${id}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    return res.data.data;
  },

  // Delete product by ID
  deleteProduct: async (id: string): Promise<void> => {
    await axios.delete<DeleteProductResponse>(`${API_BASE_URL}/${id}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
  },
};

export default productService;
