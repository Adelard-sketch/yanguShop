import api from './api';

const paymentService = {
  initiatePayment: async ({ amount, currency = 'UGX', order = null, redirectUrl = null }) => {
    try {
      const res = await api.post('/payments/initiate', { amount, currency, order, redirectUrl });
      return res.data; // { paymentId, checkoutUrl, status }
    } catch (err) {
      throw err.response?.data?.message || 'Failed to initiate payment';
    }
  },

  getPaymentStatus: async (paymentId) => {
    try {
      const res = await api.get(`/payments/${paymentId}/status`);
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to fetch payment status';
    }
  }
};

export default paymentService;
