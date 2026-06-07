import '../../../../core/network/api_client.dart';
import '../../../../core/network/endpoints.dart';
import '../../../../core/services/secure_storage_service.dart';
import '../../domain/entities/user.dart';

class AuthRepository {
  final _dio = ApiClient.instance.dio;

  Future<User> login({required String email, required String password}) async {
    final response = await _dio.post(Endpoints.login, data: {
      'email': email,
      'password': password,
    });

    final data = response.data['data'] as Map<String, dynamic>;
    await SecureStorageService.instance.saveToken(data['token'] as String);
    return User.fromJson(data['user'] as Map<String, dynamic>);
  }

  Future<User> register({required String email, required String password, String? fullName}) async {
    final response = await _dio.post(Endpoints.register, data: {
      'email': email,
      'password': password,
      if (fullName != null) 'fullName': fullName,
    });

    final data = response.data['data'] as Map<String, dynamic>;
    await SecureStorageService.instance.saveToken(data['token'] as String);
    return User.fromJson(data['user'] as Map<String, dynamic>);
  }

  Future<void> logout() => SecureStorageService.instance.clearToken();
}
