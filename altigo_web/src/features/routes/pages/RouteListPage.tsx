import { useEffect } from 'react';
import { useRoutesStore } from '../store/routesStore';
import { RouteCard } from '../components/RouteCard';

export function RouteListPage() {
  const { routes, isLoading, error, fetchRoutes } = useRoutesStore();

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  return (
    <div className="page">
      <h1>Rutas de montaña</h1>
      {isLoading && <p>Cargando rutas...</p>}
      {error && <p className="form-error">{error}</p>}
      <div className="route-list">
        {routes.map((route) => (
          <RouteCard key={route.id} route={route} />
        ))}
      </div>
    </div>
  );
}
