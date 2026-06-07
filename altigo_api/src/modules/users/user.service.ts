import { AppError } from '../../shared/errors/app-error';
import { userRepository } from './user.repository';

export const userService = {
  async getProfile(userId: string) {
    const profile = await userRepository.findProfileById(userId);
    if (!profile) throw new AppError('USER_NOT_FOUND', 'Usuario no encontrado', 404);
    return profile;
  },
};
