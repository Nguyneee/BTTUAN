import axiosClient from './axiosClient';

export const authAPI = {
  login:         (data) => axiosClient.post('/auth/login', data),
  register:      (data) => axiosClient.post('/auth/register', data),
  refresh:       (data) => axiosClient.post('/auth/refresh', data),
  logout:        ()     => axiosClient.post('/auth/logout'),
  getMe:         ()     => axiosClient.get('/auth/me'),
  updateProfile: (data) => axiosClient.put('/auth/me', data),
};
