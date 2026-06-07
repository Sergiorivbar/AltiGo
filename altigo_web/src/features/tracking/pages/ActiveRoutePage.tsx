import { useParams } from 'react-router-dom';
import { useGeolocation } from '../../../core/hooks/useGeolocation';

/**
 * Shown once GPS tracking starts — immediately for PREMIUM users, or right
 * after the simulated interstitial closes for FREE users.
 */
export function ActiveRoutePage() {
  const { routeId } = useParams<{ routeId: string }>();
  const { position, error } = useGeolocation(true);

  return (
    <div className="page page--centered">
      <h1>Ruta en curso</h1>
      <p className="muted">Ruta #{routeId}</p>

      {error && <p className="form-error">Error de GPS: {error}</p>}

      {!error && !position && <p>Obteniendo tu posición...</p>}

      {position && (
        <div className="gps-card">
          <span className="gps-card__icon">📍</span>
          <p>Lat: {position.latitude.toFixed(5)}</p>
          <p>Lng: {position.longitude.toFixed(5)}</p>
          <p>Altitud: {position.altitude !== null ? `${position.altitude.toFixed(0)} m` : '—'}</p>
          <p>Velocidad: {position.speed !== null ? `${position.speed.toFixed(1)} m/s` : '—'}</p>
          <p>Precisión: ±{position.accuracy.toFixed(0)} m</p>
        </div>
      )}
    </div>
  );
}
