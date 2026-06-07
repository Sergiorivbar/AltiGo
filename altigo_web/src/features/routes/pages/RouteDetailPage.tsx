import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { routesApi } from '../api/routesApi';
import { DIFFICULTY_LABELS, type MountainRoute } from '../types';
import { MapboxView } from '../../map/components/MapboxView';
import { StartRouteButton } from '../../tracking/components/StartRouteButton';
import { PhotoGallery } from '../../media/components/PhotoGallery';

export function RouteDetailPage() {
  const { routeId } = useParams<{ routeId: string }>();
  const [route, setRoute] = useState<MountainRoute | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!routeId) return;
    routesApi
      .detail(routeId)
      .then(setRoute)
      .catch(() => setError('No se pudo cargar la ruta.'));
  }, [routeId]);

  if (error) return <div className="page"><p className="form-error">{error}</p></div>;
  if (!route) return <div className="page"><p>Cargando ruta...</p></div>;

  return (
    <div className="page">
      <MapboxView track={route.trackGeoJson} />

      <div className="route-detail">
        <h1>{route.name}</h1>
        {route.description && <p className="muted">{route.description}</p>}

        <div className="route-detail__stats">
          <span>{(route.distanceMeters / 1000).toFixed(1)} km</span>
          <span>+{route.elevationGainM.toFixed(0)} m / -{route.elevationLossM.toFixed(0)} m</span>
          <span>{DIFFICULTY_LABELS[route.difficulty]}</span>
          {route.estimatedDurationMin && <span>~{route.estimatedDurationMin} min</span>}
        </div>

        <StartRouteButton routeId={route.id} />

        <h2>Fotos de la ruta</h2>
        <PhotoGallery routeId={route.id} />
      </div>
    </div>
  );
}
