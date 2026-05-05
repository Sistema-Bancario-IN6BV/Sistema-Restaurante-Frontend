import { create } from "zustand";
import * as restaurantsApi from "../../../shared/api/restaurants.js";

export const useRestaurantStore = create((set, get) => ({
    restaurants: [],
    currentRestaurant: null,
    loading: false,
    error: null,

    fetchRestaurants: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const result = await restaurantsApi.getRestaurants(params);
            set({
                restaurants: result.data || [],
                loading: false
            });
        } catch (err) {
            set({
                error: err.response?.data?.message || err.message,
                loading: false
            });
        }
    },

    fetchRestaurantsByAdmin: async (adminId) => {
        set({ loading: true, error: null });
        try {
            const result = await restaurantsApi.getRestaurantsByAdmin(adminId);
            set({
                restaurants: result.data || [],
                loading: false
            });
        } catch (err) {
            set({
                error: err.response?.data?.message || err.message,
                loading: false
            });
        }
    },

    fetchRestaurantById: async (id) => {
        set({ loading: true, error: null });
        try {
            const result = await restaurantsApi.getRestaurantById(id);
            set({
                currentRestaurant: result.data,
                loading: false
            });
            return { success: true, data: result.data };
        } catch (err) {
            set({
                error: err.response?.data?.message || err.message,
                loading: false
            });
            return {
                success: false,
                error: err.response?.data?.message || err.message
            };
        }
    },

    setCurrentRestaurant: (restaurant) => set({ currentRestaurant: restaurant }),
}));
