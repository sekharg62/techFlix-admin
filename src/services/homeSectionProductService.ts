import axios from 'axios';
import { API_URL } from './apiClient';
import type {
  HomeSectionProduct,
  CreateHomeSectionProductPayload,
  UpdateHomeSectionProductPayload,
  GetAllHomeSectionProductsResponse,
  SingleHomeSectionProductResponse,
  DeleteHomeSectionProductResponse,
} from '../types/homeSection';

const API_BASE_URL = `${API_URL}/home-section-products`;
const SECTIONS_API_URL = `${API_URL}/home-sections`;

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

export const homeSectionProductService = {
  // 1. Get all associations (supports ?homeSectionId=... & ?productId=...)
  getAllAssociations: async (params?: { homeSectionId?: string; productId?: string }): Promise<HomeSectionProduct[]> => {
    const res = await axios.get<GetAllHomeSectionProductsResponse>(API_BASE_URL, {
      headers: {
        ...getAuthHeaders(),
      },
      params,
    });
    return res.data.data;
  },

  // 2. Get all products linked to a specific section by section ID
  getProductsBySectionId: async (homeSectionId: string): Promise<HomeSectionProduct[]> => {
    const res = await axios.get<GetAllHomeSectionProductsResponse>(`${API_BASE_URL}/section/${homeSectionId}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    return res.data.data;
  },

  // 3. Get a specific association record by ID
  getAssociationById: async (id: string): Promise<HomeSectionProduct> => {
    const res = await axios.get<SingleHomeSectionProductResponse>(`${API_BASE_URL}/${id}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    return res.data.data;
  },

  // 4. Link a product to a home section (POST /api/home-section-products)
  linkProductToSection: async (payload: CreateHomeSectionProductPayload): Promise<HomeSectionProduct> => {
    const res = await axios.post<SingleHomeSectionProductResponse>(API_BASE_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    return res.data.data;
  },

  // 5. Update an existing association record (PUT /api/home-section-products/:id)
  updateAssociation: async (id: string, payload: UpdateHomeSectionProductPayload): Promise<HomeSectionProduct> => {
    const res = await axios.put<SingleHomeSectionProductResponse>(`${API_BASE_URL}/${id}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    return res.data.data;
  },

  // 6. Delete association by ID (DELETE /api/home-section-products/:id)
  removeProductFromSection: async (id: string): Promise<void> => {
    await axios.delete<DeleteHomeSectionProductResponse>(`${API_BASE_URL}/${id}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
  },

  // 7. Alternative: Add product directly via home-sections nested route (POST /api/home-sections/:id/products)
  addProductDirect: async (homeSectionId: string, productId: string): Promise<any> => {
    const res = await axios.post(
      `${SECTIONS_API_URL}/${homeSectionId}/products`,
      { productId },
      {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      }
    );
    return res.data;
  },

  // 8. Alternative: Remove product directly via home-sections nested route (DELETE /api/home-sections/:id/products/:productId)
  removeProductDirect: async (homeSectionId: string, productId: string): Promise<void> => {
    await axios.delete(`${SECTIONS_API_URL}/${homeSectionId}/products/${productId}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
  },
};

export default homeSectionProductService;
