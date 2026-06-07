import 'package:dio/dio.dart';
import '../config/env.dart';
import '../services/secure_storage_service.dart';

/// Thin wrapper around Dio that injects the JWT (when present) into every
/// outgoing request and centralizes the base URL configuration.
class ApiClient {
  ApiClient._internal() {
    _dio = Dio(BaseOptions(baseUrl: Env.apiBaseUrl, connectTimeout: const Duration(seconds: 15)));

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await SecureStorageService.instance.readToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
      ),
    );
  }

  static final ApiClient instance = ApiClient._internal();
  late final Dio _dio;

  Dio get dio => _dio;
}
