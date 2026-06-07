import { pool } from '../../config/database';

export const authRepository = {
  async findByEmail(email: string) {
    const { rows } = await pool.query(
      `SELECT id, email, password_hash, full_name, role
       FROM users WHERE email = $1`,
      [email],
    );
    return rows[0] ?? null;
  },

  async createUser(params: { email: string; passwordHash: string; fullName?: string }) {
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, full_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, full_name, role`,
      [params.email, params.passwordHash, params.fullName ?? null],
    );
    return rows[0];
  },
};
