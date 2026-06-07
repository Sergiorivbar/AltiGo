import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/services/admob_service.dart';
import '../../../../core/services/location_service.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../pages/active_route_page.dart';

/// The monetization centerpiece: when the user taps "Iniciar Ruta" we check
/// their role (resolved from the backend, not guessed on-device).
///   - FREE    -> show a full-screen AdMob interstitial; once dismissed, start GPS
///   - PREMIUM -> skip the ad and start the GPS tracking immediately
class StartRouteButton extends ConsumerStatefulWidget {
  const StartRouteButton({super.key, required this.routeId});

  final String routeId;

  @override
  ConsumerState<StartRouteButton> createState() => _StartRouteButtonState();
}

class _StartRouteButtonState extends ConsumerState<StartRouteButton> {
  bool _isProcessing = false;

  Future<void> _onStartRoutePressed() async {
    if (_isProcessing) return;
    setState(() => _isProcessing = true);

    try {
      final user = ref.read(currentUserProvider);
      if (user == null) {
        _showError('Debes iniciar sesión para empezar una ruta.');
        return;
      }

      // 1. Check GPS permissions BEFORE showing the ad — no point making the
      //    user sit through an interstitial if tracking can't start afterwards.
      final hasLocationPermission = await LocationService().ensurePermissions();
      if (!hasLocationPermission) {
        _showError('Necesitamos acceso a tu ubicación para iniciar la ruta.');
        return;
      }

      // 2. THE CONDITIONAL LOGIC — heart of the monetization flow.
      //    `user.isPremium` is resolved from the backend's
      //    /billing/subscription-status endpoint (source of truth),
      //    not something the client decides on its own.
      if (!user.isPremium) {
        // FREE user -> show the interstitial and WAIT for it to be dismissed
        await AdMobService.instance.showInterstitialAndWait();
      }
      // PREMIUM user -> skip the block above entirely

      // 3. Start the route (GPS + navigation to the active tracking screen)
      if (!mounted) return;
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => ActiveRoutePage(routeId: widget.routeId)),
      );
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    return ElevatedButton.icon(
      onPressed: _isProcessing ? null : _onStartRoutePressed,
      icon: _isProcessing
          ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
          : const Icon(Icons.play_arrow),
      label: Text(_isProcessing ? 'Preparando...' : 'Iniciar Ruta'),
      style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(52)),
    );
  }
}
