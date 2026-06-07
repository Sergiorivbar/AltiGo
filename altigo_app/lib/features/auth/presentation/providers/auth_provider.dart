import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_client.dart';
import '../../../../core/network/endpoints.dart';
import '../../data/repositories/auth_repository.dart';
import '../../domain/entities/user.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) => AuthRepository());

/// Holds the currently authenticated user, including the resolved
/// `isPremiumActive` flag fetched from the backend's billing endpoint.
/// This is what `StartRouteButton` reads to decide whether to show the
/// AdMob interstitial.
class AuthController extends StateNotifier<User?> {
  AuthController(this._ref) : super(null);

  final Ref _ref;

  Future<void> login(String email, String password) async {
    final user = await _ref.read(authRepositoryProvider).login(email: email, password: password);
    state = user;
    await refreshSubscriptionStatus();
  }

  Future<void> register(String email, String password, {String? fullName}) async {
    final user = await _ref
        .read(authRepositoryProvider)
        .register(email: email, password: password, fullName: fullName);
    state = user;
    await refreshSubscriptionStatus();
  }

  /// Calls GET /billing/subscription-status — the source of truth for
  /// whether the user currently skips the AdMob interstitial.
  Future<void> refreshSubscriptionStatus() async {
    final current = state;
    if (current == null) return;

    final response = await ApiClient.instance.dio.get(Endpoints.subscriptionStatus);
    final data = response.data['data'] as Map<String, dynamic>;
    state = current.copyWith(
      role: userRoleFromString(data['role'] as String),
      isPremiumActive: data['isPremium'] as bool,
    );
  }

  Future<void> logout() async {
    await _ref.read(authRepositoryProvider).logout();
    state = null;
  }
}

final authControllerProvider = StateNotifierProvider<AuthController, User?>(
  (ref) => AuthController(ref),
);

/// Convenience provider used directly by widgets like `StartRouteButton`.
final currentUserProvider = Provider<User?>((ref) => ref.watch(authControllerProvider));
