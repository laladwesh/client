import api from './api';

export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getMyOrders = async () => {
  try {
    const response = await api.get('/orders/my');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getOrder = async (id) => {
  try {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllOrders = async () => {
  try {
    const response = await api.get('/orders');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
