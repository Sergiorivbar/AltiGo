import '../../../../core/network/api_client.dart';
import '../../../../core/network/endpoints.dart';

class SubscriptionRepository {
  final _dio = ApiClient.instance.dio;

  /// Triggers the simulated Stripe (test-mode) subscription flow on the
  /// backend. On success the backend flips `users.role` to 'premium'.
  Future<void> subscribeToPremium({String? paymentMethodId}) async {
    await _dio.post(Endpoints.subscribe, data: {
      if (paymentMethodId != null) 'paymentMethodId': paymentMethodId,
    });
  }
}
