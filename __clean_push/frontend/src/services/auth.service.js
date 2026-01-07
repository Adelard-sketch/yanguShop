import api from './api';

export const login = (creds) => api.post('/auth/login', creds).then(r => r.data);
export const register = (data) => api.post('/auth/register', data).then(r => r.data);
export const forgotPassword = (data) => api.post('/auth/forgot', data).then(r => r.data);
export const resetPassword = (data) => api.post('/auth/reset', data).then(r => r.data);

export default { login, register, forgotPassword, resetPassword };
