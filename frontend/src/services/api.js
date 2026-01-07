import axios from 'axios';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || '/api' });

// Debugging: log requests and errors to help trace 500 responses during development
api.interceptors.request.use((req) => {
	try {
		// eslint-disable-next-line no-console
		console.log('[API] Request', req.method && req.method.toUpperCase(), req.url || req.baseURL, req.params || '');
	} catch (e) {}
	return req;
});

api.interceptors.response.use(
	(res) => {
		try { // eslint-disable-next-line no-console
			console.log('[API] Response', res.status, res.config && res.config.url);
		} catch (e) {}
		return res;
	},
	(err) => {
		try { // eslint-disable-next-line no-console
			console.error('[API] Error', err.config && err.config.url, err.response && err.response.status, err.response && err.response.data);
		} catch (e) {}
		return Promise.reject(err);
	}
);

export function setAuthToken(token) {
	if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
	else delete api.defaults.headers.common['Authorization'];
}

export default api;
