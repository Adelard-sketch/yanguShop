import api from './api';

const BASE = '/chats';

const chatService = {
  createChat: async (subject, category, message) => {
    try {
      const response = await api.post(`${BASE}`, {
        subject,
        category,
        message
      });
      return response.data.chat;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create chat';
    }
  },

  getUserChats: async (status = null, category = null, limit = 20, page = 1) => {
    try {
      let url = `${BASE}?limit=${limit}&page=${page}`;
      if (status) url += `&status=${status}`;
      if (category) url += `&category=${category}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch chats';
    }
  },

  getChatById: async (id) => {
    try {
      const response = await api.get(`${BASE}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch chat';
    }
  },

  addMessage: async (chatId, message) => {
    try {
      const response = await api.post(`${BASE}/${chatId}/message`, {
        message
      });
      return response.data.chat;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to send message';
    }
  },

  // Admin/Agent methods
  getAllChats: async (status = null, category = null, limit = 50, page = 1) => {
    try {
      let url = `${BASE}/admin/all?limit=${limit}&page=${page}`;
      if (status) url += `&status=${status}`;
      if (category) url += `&category=${category}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch chats';
    }
  },

  updateChatStatus: async (id, status, priority = null, assignedAgent = null) => {
    try {
      const response = await api.put(`${BASE}/${id}/status`, {
        status,
        priority,
        assignedAgent
      });
      return response.data.chat;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update chat';
    }
  },

  getChatStats: async () => {
    try {
      const response = await api.get(`${BASE}/admin/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch stats';
    }
  }
,

  respondToChart: async (chatId, chartIndex, content) => {
    try {
      const response = await api.post(`${BASE}/${chatId}/charts/${chartIndex}/respond`, { content });
      return response.data.chat;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to respond to chart';
    }
  }
};

export default chatService;
