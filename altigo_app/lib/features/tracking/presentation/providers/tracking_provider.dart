import 'package:geolocator/geolocator.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/services/location_service.dart';

final locationServiceProvider = Provider<LocationService>((ref) => LocationService());

/// Live GPS stream consumed by `ActiveRoutePage` while a route is in progress.
final positionStreamProvider = StreamProvider.autoDispose<Position>((ref) {
  return ref.read(locationServiceProvider).trackPosition();
});
