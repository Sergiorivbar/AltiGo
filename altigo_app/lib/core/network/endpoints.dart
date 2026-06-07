/// REST endpoints exposed by the AltiGo Node.js/Express backend.
class Endpoints {
  Endpoints._();

  static const register = '/auth/register';
  static const login = '/auth/login';
  static const me = '/users/me';

  static const routes = '/routes';
  static String routeDetail(String routeId) => '/routes/$routeId';
  static String routePhotos(String routeId) => '/routes/$routeId/photos';

  static const subscriptionStatus = '/billing/subscription-status';
  static const subscribe = '/billing/subscribe';
}
