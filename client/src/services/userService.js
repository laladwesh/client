import api from './api';

export const getMyAddresses = async () => {
  const res = await api.get('/users/me/addresses');
  return res.data;
};

export const addMyAddress = async (address) => {
  const res = await api.post('/users/me/addresses', address);
  return res.data;
};

export const updateMyAddress = async (id, address) => {
  const res = await api.put(`/users/me/addresses/${id}`, address);
  return res.data;
};

export const deleteMyAddress = async (id) => {
  const res = await api.delete(`/users/me/addresses/${id}`);
  return res.data;
};
