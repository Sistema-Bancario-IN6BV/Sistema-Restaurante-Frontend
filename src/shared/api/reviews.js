import { axiosAdmin } from './api';

export const createReview = (payload) => axiosAdmin.post('/reviews', payload);

export const getReviewsByRestaurant = (restaurantId, params = {}) => axiosAdmin.get(`/reviews/restaurant/${restaurantId}`, { params });

export const getReviewById = (id) => axiosAdmin.get(`/reviews/${id}`);

export const deleteReview = (id) => axiosAdmin.delete(`/reviews/${id}`);

export default {
  createReview,
  getReviewsByRestaurant,
  getReviewById,
  deleteReview,
};
