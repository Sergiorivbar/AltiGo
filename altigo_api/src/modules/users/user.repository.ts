import { pool } from '../../config/database';

export const userRepository = {
  async findProfileById(userId: string) {
    const { rows } = await pool.query(
      `SELECT id, email, full_name, role, subscription_status, subscription_expires_at, created_at
       FROM users WHERE id = $1`,
      [userId],
    );
    return rows[0] ?? null;
  },
};
