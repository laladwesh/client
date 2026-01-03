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

export const updateOrderStage = async (id, stage) => {
  try {
    const response = await api.put(`/orders/${id}/stage`, { stage });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const trackOrder = async (id) => {
  try {
    const response = await api.get(`/orders/${id}/track`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addDelhiveryWaybill = async (id, waybill, orderId) => {
  try {
    const response = await api.put(`/orders/${id}/delhivery/waybill`, { waybill, orderId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createDelhiveryShipment = async (id) => {
  try {
    const response = await api.post(`/orders/${id}/delhivery/shipment`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const cancelDelhiveryShipment = async (id) => {
  try {
    const response = await api.delete(`/orders/${id}/delhivery/cancel`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
