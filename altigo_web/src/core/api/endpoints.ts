export const endpoints = {
  register: '/auth/register',
  login: '/auth/login',
  me: '/users/me',

  routes: '/routes',
  routeDetail: (routeId: string) => `/routes/${routeId}`,
  routePhotos: (routeId: string) => `/routes/${routeId}/photos`,

  subscriptionStatus: '/billing/subscription-status',
  subscribe: '/billing/subscribe',
};
