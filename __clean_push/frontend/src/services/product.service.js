import api from './api';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
const BACKEND_URL = API_BASE_URL.replace('/api', ''); // Remove /api to get base backend URL

// Helper function to resolve image URLs
export const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  // If it's a data URI or blob URL, return as-is (don't treat as relative path)
  if (typeof imageUrl === 'string' && (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:'))) {
    return imageUrl;
  }
  
  // If it's a non-string (like an imported image module), convert to string directly
  if (typeof imageUrl !== 'string') {
    // Imported images from webpack are string paths
    return String(imageUrl);
  }
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it looks like a bundled webpack asset (contains /static/), return as is
  if (imageUrl.includes('/static/')) {
    return imageUrl;
  }
  
  // If it's a public asset path like /assets/, try to resolve from webpack first
  // This handles both backend and frontend asset references
  if (imageUrl.startsWith('/assets/')) {
    // Try to return as-is first - the browser might serve from public folder
    return imageUrl;
  }
  
  // If it's a relative path starting with /, prepend backend URL
  if (imageUrl.startsWith('/')) {
    return `${BACKEND_URL}${imageUrl}`;
  }
  
  // Otherwise assume it's a relative path
  return `${BACKEND_URL}/${imageUrl}`;
};

export const listProducts = (params = {}) => api.get('/products', { params }).then(r => r.data);
export const getProduct = (id) => api.get(`/products/${id}`).then(r => r.data && r.data.product ? r.data.product : r.data);

export default { listProducts, getProduct, resolveImageUrl };

