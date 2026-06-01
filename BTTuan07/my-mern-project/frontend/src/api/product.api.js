import axiosClient from './axiosClient';

export const productAPI = {
  getAll: (params) => axiosClient.get('/products', { params }),
  getById: (id) => axiosClient.get(`/products/${id}`),
  getPopular: (params) => axiosClient.get('/products/popular', { params }),
};
