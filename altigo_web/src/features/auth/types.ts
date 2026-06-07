export type UserRole = 'free' | 'premium' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  /** Resolved from /billing/subscription-status — source of truth for the ad logic. */
  isPremium: boolean;
}

export interface AuthResponseDto {
  token: string;
  user: { id: string; email: string; fullName: string | null; role: UserRole };
}
