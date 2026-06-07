import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/services/admob_service.dart';
import '../../../map/presentation/widgets/mapbox_view.dart';
import '../../../tracking/presentation/widgets/start_route_button.dart';
import '../providers/routes_provider.dart';

class RouteDetailPage extends ConsumerStatefulWidget {
  const RouteDetailPage({super.key, required this.routeId});

  final String routeId;

  @override
  ConsumerState<RouteDetailPage> createState() => _RouteDetailPageState();
}

class _RouteDetailPageState extends ConsumerState<RouteDetailPage> {
  @override
  void initState() {
    super.initState();
    // Pre-load the interstitial as soon as the user opens the route detail,
    // so it's ready by the time they tap "Iniciar Ruta".
    AdMobService.instance.preloadInterstitial();
  }

  @override
  Widget build(BuildContext context) {
    final routeAsync = ref.watch(routeDetailProvider(widget.routeId));

    return Scaffold(
      appBar: AppBar(title: const Text('Detalle de la ruta')),
      body: routeAsync.when(
        data: (route) => Column(
          children: [
            Expanded(child: MapboxView(routeId: route.id)),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(route.name, style: Theme.of(context).textTheme.headlineSmall),
                  const SizedBox(height: 4),
                  Text(
                    '${route.distanceKm.toStringAsFixed(1)} km · '
                    '+${route.elevationGainM.toStringAsFixed(0)} m / '
                    '-${route.elevationLossM.toStringAsFixed(0)} m',
                  ),
                  const SizedBox(height: 16),
                  StartRouteButton(routeId: route.id),
                ],
              ),
            ),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('No se pudo cargar la ruta: $error')),
      ),
    );
  }
}
