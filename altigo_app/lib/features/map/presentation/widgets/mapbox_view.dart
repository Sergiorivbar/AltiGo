import 'package:flutter/material.dart';
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart';

import '../../../../core/config/env.dart';

/// Renders the route track on a Mapbox topographic/outdoors map style.
/// `routeId` is used to fetch and draw the GeoJSON track returned by the
/// backend's `/routes/:id` endpoint (track_geojson, computed via PostGIS
/// `ST_AsGeoJSON`).
class MapboxView extends StatefulWidget {
  const MapboxView({super.key, required this.routeId});

  final String routeId;

  @override
  State<MapboxView> createState() => _MapboxViewState();
}

class _MapboxViewState extends State<MapboxView> {
  MapboxMap? _mapboxMap;

  @override
  void initState() {
    super.initState();
    MapboxOptions.setAccessToken(Env.mapboxAccessToken);
  }

  void _onMapCreated(MapboxMap mapboxMap) {
    _mapboxMap = mapboxMap;
    // TODO: fetch the route's track_geojson from the backend and draw it
    // as a GeoJsonSource + LineLayer using `_mapboxMap!.style.addSource/addLayer`.
  }

  @override
  Widget build(BuildContext context) {
    return MapWidget(
      key: ValueKey('mapbox-${widget.routeId}'),
      styleUri: MapboxStyles.OUTDOORS, // topographic/outdoors style — ideal for hiking
      cameraOptions: CameraOptions(
        center: Point(coordinates: Position(-3.70379, 40.41678)), // fallback: Madrid
        zoom: 11,
      ),
      onMapCreated: _onMapCreated,
    );
  }
}
