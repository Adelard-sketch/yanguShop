import api from './api';

const isValidObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(id);

export const createOrder = async (data) => {
  // If any item product id doesn't look like a Mongo ObjectId, fallback to a client-side simulated order
  const allIdsValid = Array.isArray(data.items) && data.items.every(i => isValidObjectId(String(i.product)));
  if (!allIdsValid) {
    // Simulate order creation locally for demo/sample products
    const fakeOrder = {
      _id: `demo-${Date.now()}`,
      items: data.items,
      total: data.total,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      status: 'placed',
      createdAt: new Date().toISOString()
    };
    // Mimic async API
    return new Promise(resolve => setTimeout(() => resolve(fakeOrder), 400));
  }

  const res = await api.post('/orders', data);
  return res.data;
};

export default { createOrder };
