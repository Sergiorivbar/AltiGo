import { AppError } from '../../shared/errors/app-error';
import { routeRepository } from './route.repository';

export const routeService = {
  async listRoutes() {
    return routeRepository.findAll();
  },

  async getRouteDetail(routeId: string) {
    const route = await routeRepository.findById(routeId);
    if (!route) throw new AppError('ROUTE_NOT_FOUND', 'Ruta no encontrada', 404);
    return route;
  },

  /** Geospatial search powered by PostGIS ST_DWithin / ST_Distance. */
  async findRoutesNearby(lat: number, lng: number, radiusKm = 20) {
    return routeRepository.findNear({ lat, lng, radiusMeters: radiusKm * 1000 });
  },
};
