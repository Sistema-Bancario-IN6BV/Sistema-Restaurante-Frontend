import { create } from "zustand"
import * as restaurantApi from "../../../shared/api/restaurants.js"

const getAllRestaurants = restaurantApi.getAllRestaurants;
const updateRestaurantStatusRequest = restaurantApi.updateRestaurantStatus;

export const useRestaurantManagmentStore = create((set, get) => ({
    restaurants: [],
    loading: false,
    error: null,
    filters: {},

    setFilters: (filters) => set({ filters }),

    setRestaurants: (restaurants) => set({ restaurants }),

    updateRestaurantStatus: async (restaurantId, isActive) => {
        set({ loading: true, error: null });
        try {
            if (typeof updateRestaurantStatusRequest !== "function") {
                throw new Error("La función updateRestaurantStatus no esta disponible");
            }

            const { data: updatedRestaurant } = await updateRestaurantStatusRequest(
                restaurantId,
                isActive
            );

            const restaurants = get().restaurants.map((r) =>
                r.id === updatedRestaurant.id ? { ...r, active: updatedRestaurant.active } : r
            )

            set({ restaurants, loading: false })
            return { success: true, restaurant: updatedRestaurant }
        } catch (err) {
            set({
                error:
                    err.response?.data?.message || err.message || "Error al cambiar estado del restaurante",
                loading: false
            })
            return {
                success: false,
                error: err.response?.data?.message || err.message
            }
        }
    },

    fetchRestaurants: async (apiFn = getAllRestaurants, options = {}) => {

        const { force = false } = options;
        const state = get();

        //Evitar llamdas duplicadas.
        if (state.loading) return;

        //Por si ya están cargados, no volver a pedir a menos que se fuerce.
        if (!force && state.restaurants.length > 0) return;

        set({ loading: true, error: null })

        try {

            const fetcher = typeof apiFn === "function" ? apiFn : getAllRestaurants;

            const result = await fetcher();

            set({ restaurants: result.restaurants || result, loading: false });

        } catch (err) {
            set({ error: err.message || "Error al cargar restaurantes", loading: false });
        }
    }
}))
