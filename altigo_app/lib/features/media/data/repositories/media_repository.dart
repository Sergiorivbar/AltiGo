import 'package:dio/dio.dart';

import '../../../../core/network/api_client.dart';
import '../../../../core/network/endpoints.dart';

class MediaRepository {
  final _dio = ApiClient.instance.dio;

  /// Uploads a route photo (multipart/form-data). The backend simulates
  /// storing it in the cloud and returns the resulting public URL.
  Future<Map<String, dynamic>> uploadRoutePhoto({
    required String routeId,
    required String filePath,
    String? caption,
  }) async {
    final formData = FormData.fromMap({
      if (caption != null) 'caption': caption,
      'photo': await MultipartFile.fromFile(filePath),
    });

    final response = await _dio.post(Endpoints.routePhotos(routeId), data: formData);
    return response.data['data'] as Map<String, dynamic>;
  }

  Future<List<Map<String, dynamic>>> fetchRoutePhotos(String routeId) async {
    final response = await _dio.get(Endpoints.routePhotos(routeId));
    return (response.data['data'] as List<dynamic>).cast<Map<String, dynamic>>();
  }
}
