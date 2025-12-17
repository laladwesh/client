import api from './api';

export const getBlogs = async () => {
  try {
    const res = await api.get('/blogs');
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const getBlog = async (id) => {
  try {
    const res = await api.get(`/blogs/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const createBlog = async (data) => {
  try {
    const res = await api.post('/blogs', data);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const updateBlog = async (id, data) => {
  try {
    const res = await api.put(`/blogs/${id}`, data);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const deleteBlog = async (id) => {
  try {
    const res = await api.delete(`/blogs/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};
