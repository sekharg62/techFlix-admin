import axios from 'axios';
import type {
  Review,
  CreateReviewPayload,
  UpdateReviewPayload,
  GetAllReviewsResponse,
  SingleReviewResponse,
  DeleteReviewResponse,
} from '../types/review';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reviews`;

export const reviewService = {
  // Fetch all reviews
  getAllReviews: async (): Promise<Review[]> => {
    const res = await axios.get<GetAllReviewsResponse>(API_BASE_URL);
    return res.data.data;
  },

  // Fetch single review by ID
  getReviewById: async (id: string): Promise<Review> => {
    const res = await axios.get<SingleReviewResponse>(`${API_BASE_URL}/${id}`);
    return res.data.data;
  },

  // Create a new review
  createReview: async (payload: CreateReviewPayload): Promise<Review> => {
    const res = await axios.post<SingleReviewResponse>(API_BASE_URL, payload);
    return res.data.data;
  },

  // Edit review by ID
  updateReview: async (id: string, payload: UpdateReviewPayload): Promise<Review> => {
    const res = await axios.put<SingleReviewResponse>(`${API_BASE_URL}/${id}`, payload);
    return res.data.data;
  },

  // Delete review by ID
  deleteReview: async (id: string): Promise<void> => {
    await axios.delete<DeleteReviewResponse>(`${API_BASE_URL}/${id}`);
  },
};

export default reviewService;
