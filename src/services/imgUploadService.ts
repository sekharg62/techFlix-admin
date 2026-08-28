import axios from 'axios';
import type { AxiosProgressEvent } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ImageUploadData {
  public_id: string;
  url: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
}

export interface ImageUploadSuccessResponse {
  success: true;
  message: string;
  url: string;
  data: ImageUploadData;
}

export interface ImageUploadErrorResponse {
  success: false;
  message: string;
}

export type ImageUploadResponse = ImageUploadSuccessResponse | ImageUploadErrorResponse;

export interface UploadImageOptions {
  folder?: string;
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
}

export const imgUploadService = {
  /**
   * Uploads an image to Cloudinary via backend endpoint
   * @param file The image File to upload (Max size 5MB, MIME type image/*)
   * @param options Optional configuration including target folder and progress callback
   * @returns Promise resolving to ImageUploadResponse
   */
  async uploadImage(
    file: File,
    options?: UploadImageOptions | string
  ): Promise<ImageUploadResponse> {
    const folder = typeof options === 'string' ? options : options?.folder || 'techflix';
    const onUploadProgress = typeof options === 'object' ? options?.onUploadProgress : undefined;

    // Client-side validation: MIME type check
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        message: 'Invalid file type. Please upload a valid image file (image/*).',
      };
    }

    // Client-side validation: Max size (5MB = 5 * 1024 * 1024 bytes)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return {
        success: false,
        message: 'File size exceeds the 5MB limit. Please upload a smaller image.',
      };
    }

    const formData = new FormData();
    formData.append('image', file);
    if (folder) {
      formData.append('folder', folder);
    }

    try {
      const response = await axios.post<ImageUploadSuccessResponse>(
        `${API_URL}/upload/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress,
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data as ImageUploadErrorResponse;
      }
      return {
        success: false,
        message: error.message || 'Failed to upload image',
      };
    }
  },
};

export default imgUploadService;
