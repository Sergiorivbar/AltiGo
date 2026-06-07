import { randomUUID } from 'crypto';
import { pool } from '../../config/database';

/**
 * Simulates uploading to cloud storage (e.g. S3 / Cloud Storage).
 * In this test setup we just generate a deterministic "cloud" URL —
 * swap this function for a real SDK call (e.g. @aws-sdk/client-s3) in production.
 */
function simulateCloudUpload(originalName: string, buffer: Buffer): string {
  const key = `${randomUUID()}-${originalName}`;
  void buffer; // would be streamed to the real bucket here
  return `https://storage.altigo.test/route-photos/${key}`;
}

export const mediaService = {
  async uploadRoutePhoto(params: {
    routeId: string;
    userId: string;
    file: { originalname: string; buffer: Buffer };
    caption?: string;
  }) {
    const photoUrl = simulateCloudUpload(params.file.originalname, params.file.buffer);

    const { rows } = await pool.query(
      `INSERT INTO route_photos (route_id, user_id, photo_url, caption)
       VALUES ($1, $2, $3, $4)
       RETURNING id, route_id, user_id, photo_url, caption, created_at`,
      [params.routeId, params.userId, photoUrl, params.caption ?? null],
    );
    return rows[0];
  },

  async listRoutePhotos(routeId: string) {
    const { rows } = await pool.query(
      `SELECT id, route_id, user_id, photo_url, caption, created_at
       FROM route_photos WHERE route_id = $1 ORDER BY created_at DESC`,
      [routeId],
    );
    return rows;
  },
};
