import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/repositories/routes_repository.dart';
import '../../domain/entities/mountain_route.dart';

final routesRepositoryProvider = Provider<RoutesRepository>((ref) => RoutesRepository());

final routeListProvider = FutureProvider<List<MountainRoute>>((ref) {
  return ref.read(routesRepositoryProvider).fetchRoutes();
});

final routeDetailProvider = FutureProvider.family<MountainRoute, String>((ref, routeId) {
  return ref.read(routesRepositoryProvider).fetchRouteDetail(routeId);
});
