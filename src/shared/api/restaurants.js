import { axiosAdmin } from "./api.js";

export const getRestaurants = async (params = {}) => {
    const { data } = await axiosAdmin.get("/restaurants/get", { params });
    return data;
};

export const getRestaurantsByAdmin = async (adminId) => {
    const { data } = await axiosAdmin.get("/restaurants/get", { params: { adminId } });
    return data;
};

export const getRestaurantById = async (id) => {
    const { data } = await axiosAdmin.get(`/restaurants/${id}`);
    return data;
};

export const createRestaurant = async (restaurantData) => {
    const { data } = await axiosAdmin.post("/restaurants/create", restaurantData);
    return data;
};

export const updateRestaurant = async (id, restaurantData) => {
    const { data } = await axiosAdmin.put(`/restaurants/${id}`, restaurantData);
    return data;
};

export const deleteRestaurant = async (id) => {
    const { data } = await axiosAdmin.delete(`/restaurants/${id}`);
    return data;
};
