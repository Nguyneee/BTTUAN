import axiosClient from './axiosClient';

export const authAPI = {
  // Auth
  login: (data) => axiosClient.post('/auth/login', data),
  register: (data) => axiosClient.post('/auth/register', data),
  verifyOtp: (data) => axiosClient.post('/auth/verify-otp', data),
  resendOtp: (data) => axiosClient.post('/auth/resend-otp', data),
  forgotPassword: (data) => axiosClient.post('/auth/forgot-password', data),
  resetPassword: (data) => axiosClient.post('/auth/reset-password', data),
  changePassword: (data) => axiosClient.put('/auth/change-password', data),
  refresh: (data) => axiosClient.post('/auth/refresh', data),
  logout: () => axiosClient.post('/auth/logout'),
  
  // Profile
  getMe: () => axiosClient.get('/auth/me'),
  updateProfile: (data) => axiosClient.put('/auth/me', data),
};
