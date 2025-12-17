import api from './api';

export const googleSignIn = async (credential) => {
  try {
    const response = await api.post('/auth/google', { idToken: credential });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
