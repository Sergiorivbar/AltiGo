import { useEffect, useRef, useState } from 'react';

export interface GeoPosition {
  latitude: number;
  longitude: number;
  altitude: number | null;
  speed: number | null;
  accuracy: number;
}

interface GeolocationState {
  position: GeoPosition | null;
  error: string | null;
}

/**
 * Tracks the browser's real-time location via the Geolocation API
 * (web equivalent of Flutter's `geolocator` package). Used by
 * `ActiveRoutePage` once the user starts a route.
 */
export function useGeolocation(active: boolean) {
  const [state, setState] = useState<GeolocationState>({ position: null, error: null });
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;

    if (!('geolocation' in navigator)) {
      setState({ position: null, error: 'Este navegador no soporta geolocalización.' });
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setState({
          position: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            altitude: pos.coords.altitude,
            speed: pos.coords.speed,
            accuracy: pos.coords.accuracy,
          },
          error: null,
        });
      },
      (err) => setState({ position: null, error: err.message }),
      { enableHighAccuracy: true, maximumAge: 5000 },
    );

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [active]);

  return state;
}

/** One-shot permission/availability check, mirrors `LocationService.ensurePermissions`. */
export async function ensureLocationPermission(): Promise<boolean> {
  if (!('geolocation' in navigator)) return false;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      () => resolve(true),
      () => resolve(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}
