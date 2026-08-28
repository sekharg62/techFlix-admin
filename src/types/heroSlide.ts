export interface HeroSlide {
  id: string;
  order: number;
  imageUrl: string;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

// Request Payloads
export interface CreateHeroSlidePayload {
  order: number;
  imageUrl: string;
}

export interface UpdateHeroSlidePayload {
  order?: number;
  imageUrl?: string;
}

// API Responses
export interface GetAllHeroSlidesResponse {
  success: boolean;
  count: number;
  data: HeroSlide[];
}

export interface SingleHeroSlideResponse {
  success: boolean;
  message?: string;
  data: HeroSlide;
}

export interface DeleteHeroSlideResponse {
  success: boolean;
  message: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
}
