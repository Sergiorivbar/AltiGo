import { apiClient } from '../../../core/api/apiClient';
import { endpoints } from '../../../core/api/endpoints';
import type { MountainRoute } from '../types';

interface RouteSummaryDto {
  id: string;
  name: string;
  description: string | null;
  difficulty: MountainRoute['difficulty'];
  distance_meters: string | number | null;
  elevation_gain_m: string | number | null;
  elevation_loss_m: string | number | null;
  estimated_duration_min: number | null;
  is_premium_only: boolean;
  start_point_geojson?: string;
  end_point_geojson?: string;
  track_geojson?: string;
}

function toRoute(dto: RouteSummaryDto): MountainRoute {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    difficulty: dto.difficulty,
    distanceMeters: Number(dto.distance_meters ?? 0),
    elevationGainM: Number(dto.elevation_gain_m ?? 0),
    elevationLossM: Number(dto.elevation_loss_m ?? 0),
    estimatedDurationMin: dto.estimated_duration_min,
    isPremiumOnly: dto.is_premium_only,
    startPoint: dto.start_point_geojson ? JSON.parse(dto.start_point_geojson) : null,
    endPoint: dto.end_point_geojson ? JSON.parse(dto.end_point_geojson) : null,
    trackGeoJson: dto.track_geojson ? JSON.parse(dto.track_geojson) : null,
  };
}

export const routesApi = {
  async list(): Promise<MountainRoute[]> {
    const { data } = await apiClient.get<{ data: RouteSummaryDto[] }>(endpoints.routes);
    return data.data.map(toRoute);
  },

  async detail(routeId: string): Promise<MountainRoute> {
    const { data } = await apiClient.get<{ data: RouteSummaryDto }>(endpoints.routeDetail(routeId));
    return toRoute(data.data);
  },
};
