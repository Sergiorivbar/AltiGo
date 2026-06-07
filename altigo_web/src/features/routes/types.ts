export type RouteDifficulty = 'easy' | 'moderate' | 'hard' | 'expert';

/**
 * Mirrors the `routes` table — distance/elevation are computed server-side
 * by PostGIS triggers (`calculate_route_distance`, `calculate_elevation_gain_loss`).
 */
export interface MountainRoute {
  id: string;
  name: string;
  description: string | null;
  difficulty: RouteDifficulty;
  distanceMeters: number;
  elevationGainM: number;
  elevationLossM: number;
  estimatedDurationMin: number | null;
  isPremiumOnly: boolean;
  startPoint: GeoJSON.Point | null;
  endPoint: GeoJSON.Point | null;
  trackGeoJson: GeoJSON.LineString | null;
}

export const DIFFICULTY_LABELS: Record<RouteDifficulty, string> = {
  easy: 'Fácil',
  moderate: 'Moderada',
  hard: 'Difícil',
  expert: 'Experto',
};
