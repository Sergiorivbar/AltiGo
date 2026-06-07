import { apiClient } from '../../../core/api/apiClient';
import { endpoints } from '../../../core/api/endpoints';

export interface RoutePhotoDto {
  id: string;
  route_id: string;
  user_id: string;
  photo_url: string;
  caption: string | null;
  created_at: string;
}

export const mediaApi = {
  async list(routeId: string) {
    const { data } = await apiClient.get<{ data: RoutePhotoDto[] }>(endpoints.routePhotos(routeId));
    return data.data;
  },

  /** Uploads a photo (multipart/form-data); the backend simulates storing it in the cloud. */
  async upload(routeId: string, file: File, caption?: string) {
    const formData = new FormData();
    formData.append('photo', file);
    if (caption) formData.append('caption', caption);

    const { data } = await apiClient.post<{ data: RoutePhotoDto }>(
      endpoints.routePhotos(routeId),
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.data;
  },
};
