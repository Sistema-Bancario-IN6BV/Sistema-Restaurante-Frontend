import { axiosAdmin } from './api.js';

export const getAllMenuItems = async (restaurantId, params = {}) => {
    const response = await axiosAdmin.get(`/menu/restaurants/${restaurantId}/menu`, { params });
    return response.data;
};

export const getMenuItemById = async (itemId) => {
    const response = await axiosAdmin.get(`/menu/${itemId}`);
    return response.data?.data || response.data;
};

export const createMenuItem = async (restaurantId, formData) => {
    const response = await axiosAdmin.post(`/menu/restaurants/${restaurantId}/menu`, formData);
    return response.data?.data || response.data;
};

export const updateMenuItem = async (itemId, formData) => {
    const response = await axiosAdmin.put(`/menu/${itemId}`, formData);
    return response.data?.data || response.data;
};

export const deleteMenuItem = async (itemId) => {
    const response = await axiosAdmin.delete(`/menu/${itemId}`);
    return response.data?.data || response.data;
};

export const uploadMenuItemPhoto = async (itemId, file) => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await axiosAdmin.put(`/menu/${itemId}/photo`, formData, {
        // Do not set Content-Type here — let the browser set the correct multipart boundary
        headers: {
            'Content-Type': undefined,
        },
    });
    return response.data?.data || response.data;
};

export const toggleMenuItemAvailability = async (itemId) => {
    const response = await axiosAdmin.patch(`/menu/${itemId}/availability`);
    return response.data?.data || response.data;
};
