import axios from 'axios';
import type {
  HomeSection,
  CreateHomeSectionPayload,
  UpdateHomeSectionPayload,
  GetAllHomeSectionsResponse,
  SingleHomeSectionResponse,
  DeleteHomeSectionResponse,
} from '../types/homeSection';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/home-sections`;

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

export const homeSectionService = {
  // Fetch all home sections (GET /api/home-sections)
  getAllSections: async (): Promise<HomeSection[]> => {
    const res = await axios.get<GetAllHomeSectionsResponse>(API_BASE_URL, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    return res.data.data;
  },

  // Fetch single home section by ID (GET /api/home-sections/:id)
  getSectionById: async (id: string): Promise<HomeSection> => {
    const res = await axios.get<SingleHomeSectionResponse>(`${API_BASE_URL}/${id}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    return res.data.data;
  },

  // Create a new home section (POST /api/home-sections)
  createSection: async (payload: CreateHomeSectionPayload): Promise<HomeSection> => {
    const res = await axios.post<SingleHomeSectionResponse>(API_BASE_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    return res.data.data;
  },

  // Update an existing home section (PUT / PATCH /api/home-sections/:id)
  updateSection: async (id: string, payload: UpdateHomeSectionPayload): Promise<HomeSection> => {
    const res = await axios.put<SingleHomeSectionResponse>(`${API_BASE_URL}/${id}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    return res.data.data;
  },

  // Delete a home section (DELETE /api/home-sections/:id)
  deleteSection: async (id: string): Promise<void> => {
    await axios.delete<DeleteHomeSectionResponse>(`${API_BASE_URL}/${id}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
  },
};

export default homeSectionService;
