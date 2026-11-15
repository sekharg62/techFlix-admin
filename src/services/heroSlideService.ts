import axios from 'axios';
import { API_URL } from './apiClient';
import type {
  HeroSlide,
  CreateHeroSlidePayload,
  UpdateHeroSlidePayload,
  GetAllHeroSlidesResponse,
  SingleHeroSlideResponse,
  DeleteHeroSlideResponse,
} from '../types/heroSlide';

const API_BASE_URL = `${API_URL}/hero-slides`;

export const heroSlideService = {
  // Fetch all slides ordered by order asc
  getAllSlides: async (): Promise<HeroSlide[]> => {
    const res = await axios.get<GetAllHeroSlidesResponse>(API_BASE_URL);
    return res.data.data;
  },

  // Fetch single slide by ID
  getSlideById: async (id: string): Promise<HeroSlide> => {
    const res = await axios.get<SingleHeroSlideResponse>(`${API_BASE_URL}/${id}`);
    return res.data.data;
  },

  // Create new slide
  createSlide: async (payload: CreateHeroSlidePayload): Promise<HeroSlide> => {
    const res = await axios.post<SingleHeroSlideResponse>(API_BASE_URL, payload);
    return res.data.data;
  },

  // Update slide by ID
  updateSlide: async (id: string, payload: UpdateHeroSlidePayload): Promise<HeroSlide> => {
    const res = await axios.put<SingleHeroSlideResponse>(`${API_BASE_URL}/${id}`, payload);
    return res.data.data;
  },

  // Delete slide by ID
  deleteSlide: async (id: string): Promise<void> => {
    await axios.delete<DeleteHeroSlideResponse>(`${API_BASE_URL}/${id}`);
  },
};

export default heroSlideService;
