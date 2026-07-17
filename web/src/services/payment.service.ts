import { apiClient } from './api';

export const paymentService = {
  cashCheckout: async (payload: {
    sessionId: string;
    gateOut: string;
    checkOutImage?: string;
  }): Promise<any> => {
    return apiClient.post('/payments/cash-checkout', payload);
  },

  createIntent: async (payload: { sessionId: string; method: string; checkOutImage?: string; gateOut?: string }): Promise<any> => {
    return apiClient.post('/payments/create-intent', payload);
  },

  checkStatus: async (transactionCode: string): Promise<any> => {
    return apiClient.get(`/payments/status/${transactionCode}`);
  },
};
