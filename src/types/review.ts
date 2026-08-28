export interface Review {
  id: string;
  name: string;
  role: string | null;
  description: string;
  profileUrl: string | null;
  starCount: number; // 0 to 5
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

// Request Payloads
export interface CreateReviewPayload {
  name: string;
  role?: string | null;
  description: string;
  profileUrl?: string | null;
  starCount?: number;
}

export interface UpdateReviewPayload {
  name?: string;
  role?: string | null;
  description?: string;
  profileUrl?: string | null;
  starCount?: number;
}

// API Responses
export interface GetAllReviewsResponse {
  success: boolean;
  count: number;
  data: Review[];
}

export interface SingleReviewResponse {
  success: boolean;
  message?: string;
  data: Review;
}

export interface DeleteReviewResponse {
  success: boolean;
  message: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
}
