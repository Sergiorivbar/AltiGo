import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { env } from '../../../core/config/env';

mapboxgl.accessToken = env.mapboxAccessToken;

interface MapboxViewProps {
  /** GeoJSON LineString of the route track, as returned by the backend (`ST_AsGeoJSON`). */
  track: GeoJSON.LineString | null;
  /** [lng, lat] fallback center when there's no track yet. */
  fallbackCenter?: [number, number];
}

const ROUTE_SOURCE_ID = 'route-track';
const ROUTE_LAYER_ID = 'route-track-line';

/** Renders the route track on a Mapbox topographic/outdoors style — the web port of the Flutter `MapboxView`. */
export function MapboxView({ track, fallbackCenter = [-3.70379, 40.41678] }: MapboxViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/outdoors-v12', // topographic/outdoors style — ideal for hiking
      center: fallbackCenter,
      zoom: 11,
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !track) return;

    function drawTrack() {
      if (map!.getSource(ROUTE_SOURCE_ID)) {
        (map!.getSource(ROUTE_SOURCE_ID) as mapboxgl.GeoJSONSource).setData(track!);
      } else {
        map!.addSource(ROUTE_SOURCE_ID, { type: 'geojson', data: track! });
        map!.addLayer({
          id: ROUTE_LAYER_ID,
          type: 'line',
          source: ROUTE_SOURCE_ID,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#2e5339', 'line-width': 4 },
        });
      }

      const coordinates = track!.coordinates as [number, number][];
      const bounds = coordinates.reduce(
        (acc, coord) => acc.extend(coord),
        new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]),
      );
      map!.fitBounds(bounds, { padding: 40 });
    }

    if (map.isStyleLoaded()) drawTrack();
    else map.once('load', drawTrack);
  }, [track]);

  return <div ref={containerRef} className="mapbox-view" />;
}
