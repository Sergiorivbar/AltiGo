import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/routes_provider.dart';
import '../widgets/route_card.dart';
import 'route_detail_page.dart';

class RouteListPage extends ConsumerWidget {
  const RouteListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final routesAsync = ref.watch(routeListProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Rutas de montaña')),
      body: routesAsync.when(
        data: (routes) => ListView.builder(
          itemCount: routes.length,
          itemBuilder: (context, index) {
            final route = routes[index];
            return RouteCard(
              route: route,
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => RouteDetailPage(routeId: route.id)),
              ),
            );
          },
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('No se pudieron cargar las rutas: $error')),
      ),
    );
  }
}
