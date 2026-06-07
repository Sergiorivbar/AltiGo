import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AppError } from '../../shared/errors/app-error';
import { authRepository } from './auth.repository';
import type { AuthResponse, LoginInput, RegisterInput } from './auth.types';

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '7d';

function issueToken(user: { id: string; email: string; role: string }) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError('EMAIL_TAKEN', 'Ya existe una cuenta con ese email', 409);
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await authRepository.createUser({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
    });

    return {
      token: issueToken(user),
      user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role },
    };
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await authRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError('INVALID_CREDENTIALS', 'Email o contraseña incorrectos', 401);
    }

    const passwordMatches = await bcrypt.compare(input.password, user.password_hash);
    if (!passwordMatches) {
      throw new AppError('INVALID_CREDENTIALS', 'Email o contraseña incorrectos', 401);
    }

    return {
      token: issueToken(user),
      user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role },
    };
  },
};
