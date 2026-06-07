import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/tracking_provider.dart';

/// Shown once the GPS tracking starts (immediately for PREMIUM users,
/// or right after the AdMob interstitial closes for FREE users).
class ActiveRoutePage extends ConsumerWidget {
  const ActiveRoutePage({super.key, required this.routeId});

  final String routeId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final positionAsync = ref.watch(positionStreamProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Ruta en curso')),
      body: Center(
        child: positionAsync.when(
          data: (position) => Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.gps_fixed, size: 48, color: Colors.green),
              const SizedBox(height: 12),
              Text('Lat: ${position.latitude.toStringAsFixed(5)}'),
              Text('Lng: ${position.longitude.toStringAsFixed(5)}'),
              Text('Altitud: ${position.altitude.toStringAsFixed(0)} m'),
              Text('Velocidad: ${position.speed.toStringAsFixed(1)} m/s'),
            ],
          ),
          loading: () => const CircularProgressIndicator(),
          error: (error, _) => Text('Error de GPS: $error'),
        ),
      ),
    );
  }
}
