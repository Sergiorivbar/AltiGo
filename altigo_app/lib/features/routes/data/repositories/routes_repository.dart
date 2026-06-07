import '../../../../core/network/api_client.dart';
import '../../../../core/network/endpoints.dart';
import '../../domain/entities/mountain_route.dart';

class RoutesRepository {
  final _dio = ApiClient.instance.dio;

  Future<List<MountainRoute>> fetchRoutes() async {
    final response = await _dio.get(Endpoints.routes);
    final items = response.data['data'] as List<dynamic>;
    return items.map((e) => MountainRoute.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<MountainRoute> fetchRouteDetail(String routeId) async {
    final response = await _dio.get(Endpoints.routeDetail(routeId));
    return MountainRoute.fromJson(response.data['data'] as Map<String, dynamic>);
  }
}
