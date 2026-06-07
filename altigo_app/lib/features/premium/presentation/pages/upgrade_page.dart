import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/repositories/subscription_repository.dart';

/// Lets a FREE user upgrade to Premium via the simulated Stripe (test mode)
/// checkout on the backend. After a successful charge we refresh the
/// subscription status so `StartRouteButton` immediately stops showing ads.
class UpgradePage extends ConsumerStatefulWidget {
  const UpgradePage({super.key});

  @override
  ConsumerState<UpgradePage> createState() => _UpgradePageState();
}

class _UpgradePageState extends ConsumerState<UpgradePage> {
  final _repository = SubscriptionRepository();
  bool _isProcessing = false;

  Future<void> _subscribe() async {
    setState(() => _isProcessing = true);
    try {
      // In test mode Stripe defaults to its predefined test card (4242 4242 4242 4242)
      await _repository.subscribeToPremium();
      await ref.read(authControllerProvider.notifier).refreshSubscriptionStatus();

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('¡Ya eres Premium! Disfruta de la app sin anuncios.')),
      );
      Navigator.of(context).pop();
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No se pudo procesar el pago. Inténtalo de nuevo.')),
      );
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Hazte Premium')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.workspace_premium, size: 64, color: Colors.amber),
            const SizedBox(height: 16),
            const Text(
              'Sin anuncios al iniciar tus rutas, fotos ilimitadas y rutas exclusivas.',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isProcessing ? null : _subscribe,
              child: _isProcessing
                  ? const SizedBox(
                      width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Text('Suscribirme (modo prueba Stripe)'),
            ),
          ],
        ),
      ),
    );
  }
}
