import { billingApi } from '../../auth/api/billingApi';

/** Thin re-export so the premium feature doesn't reach into `auth` internals directly. */
export const subscriptionApi = {
  subscribe: (paymentMethodId?: string) => billingApi.subscribeToPremium(paymentMethodId),
};
