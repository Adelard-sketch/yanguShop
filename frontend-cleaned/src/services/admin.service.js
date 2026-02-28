import api from './api';

// Agent Management
export const getAgents = (params = {}) => api.get('/agents', { params });
export const getAgentById = (id) => api.get(`/agents/${id}`);
export const createAgent = (data) => api.post('/agents', data);
// payload may be { reason }, { promoId }, or { promo: { code, discount, ... } }
export const approveAgent = (id, payload = {}) => api.post(`/agents/${id}/approve`, payload);
export const rejectAgent = (id, reason) => api.post(`/agents/${id}/reject`, { reason });
export const updateAgent = (id, data) => api.put(`/agents/${id}`, data);
export const deactivateAgent = (id) => api.post(`/agents/${id}/deactivate`);

// Order Management
export const getAllOrders = (params = {}) => api.get('/orders', { params });
export const getOrderStats = () => api.get('/orders/stats/overview');
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });
export const getShopOrders = (shopId, params = {}) => api.get(`/orders/shop/${shopId}`, { params });
export const getOrderById = (id) => api.get(`/orders/${id}`);

// Payment Management
export const getAllPayments = (params = {}) => api.get('/payments', { params });
export const getPaymentStats = (params = {}) => api.get('/payments/stats/overview', { params });
export const updatePaymentStatus = (id, status) => api.put(`/payments/${id}/status`, { status });

// Promo Management
// POST to /api/admin/promos (admin router) — frontend `api` base is /api
export const createPromo = (data) => api.post('/admin/promos', data);
export const assignPromoToAgent = (agentId, promoId) => api.post(`/agents/${agentId}/promos/${promoId}/assign`);

export default {
  getAgents, getAgentById, createAgent, approveAgent, rejectAgent, updateAgent, deactivateAgent,
  getAllOrders, getOrderStats, updateOrderStatus, getShopOrders, getOrderById,
  getAllPayments, getPaymentStats, updatePaymentStatus
  , createPromo, assignPromoToAgent
};
