import { Link } from 'react-router-dom';
import { DIFFICULTY_LABELS, type MountainRoute } from '../types';

export function RouteCard({ route }: { route: MountainRoute }) {
  return (
    <Link to={`/routes/${route.id}`} className="route-card">
      <div className="route-card__title">
        <span>{route.name}</span>
        {route.isPremiumOnly && <span className="badge badge--premium">Premium</span>}
      </div>
      <div className="route-card__meta">
        <span>{(route.distanceMeters / 1000).toFixed(1)} km</span>
        <span>+{route.elevationGainM.toFixed(0)} m</span>
        <span>{DIFFICULTY_LABELS[route.difficulty]}</span>
      </div>
    </Link>
  );
}
