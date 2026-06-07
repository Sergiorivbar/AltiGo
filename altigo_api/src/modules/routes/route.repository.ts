import { pool } from '../../config/database';

const ROUTE_SUMMARY_FIELDS = `
    id, name, description, difficulty,
    distance_meters, elevation_gain_m, elevation_loss_m,
    estimated_duration_min, is_premium_only,
    ST_AsGeoJSON(start_point) AS start_point_geojson,
    ST_AsGeoJSON(end_point)   AS end_point_geojson
`;

export const routeRepository = {
  async findAll() {
    const { rows } = await pool.query(`SELECT ${ROUTE_SUMMARY_FIELDS} FROM routes ORDER BY name ASC`);
    return rows;
  },

  async findById(routeId: string) {
    const { rows } = await pool.query(
      `SELECT ${ROUTE_SUMMARY_FIELDS}, ST_AsGeoJSON(track_geom) AS track_geojson
       FROM routes WHERE id = $1`,
      [routeId],
    );
    return rows[0] ?? null;
  },

  /** Routes whose start point is within `radiusMeters` of the given coordinates (PostGIS ST_DWithin). */
  async findNear(params: { lat: number; lng: number; radiusMeters: number }) {
    const { rows } = await pool.query(
      `SELECT ${ROUTE_SUMMARY_FIELDS},
              ST_Distance(start_point::geography, ST_MakePoint($1, $2)::geography) AS distance_to_user_m
       FROM routes
       WHERE ST_DWithin(start_point::geography, ST_MakePoint($1, $2)::geography, $3)
       ORDER BY distance_to_user_m ASC`,
      [params.lng, params.lat, params.radiusMeters],
    );
    return rows;
  },
};
