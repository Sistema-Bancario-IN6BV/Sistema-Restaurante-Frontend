import { create } from "zustand";
import * as inventoryApi from "../../../shared/api/inventory.js";
import { axiosAdmin } from "../../../shared/api/api.js";


const resolveRestaurantId = async () => {
    try {
        const { useRestaurantStore } = await import("../../restaurants/store/restaurantStore.js");
        const { currentRestaurant, restaurants } = useRestaurantStore.getState();
        const cached = currentRestaurant?._id || currentRestaurant?.id || restaurants?.[0]?._id || restaurants?.[0]?.id;
        if (cached) return cached;
    } catch (_) {}

    const { data } = await axiosAdmin.get("/restaurants/get");
    const list = Array.isArray(data.data) ? data.data : [data.data];
    const id = list?.[0]?._id || list?.[0]?.id;
    if (!id) throw new Error("No se encontró un restaurante para este usuario");
    return id;
};

export const useIngredientStore = create((set, get) => ({
    ingredients: [],
    loading: false,
    error: null,

    getIngredients: async () => {
        try {
            set({ loading: true, error: null });
            const restaurantId = await resolveRestaurantId();
            const result = await inventoryApi.getAllIngredients(restaurantId);
            set({
                ingredients: result.ingredients || [],
                loading: false
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || error.message || "Error al obtener ingredientes",
                loading: false
            });
        }
    },

    createIngredient: async (payload) => {
        try {
            set({ loading: true, error: null });
            const restaurantId = await resolveRestaurantId();
            const { data } = await inventoryApi.createIngredient(restaurantId, payload);
            const ingredient = data.data || data;
            
            set({
                ingredients: [...get().ingredients, ingredient],
                loading: false
            });
            return { success: true };
        } catch (error) {
            set({
                loading: false,
                error: error.response?.data?.message || error.message || "Error al crear ingrediente."
            });
            return { success: false };
        }
    },

    updateIngredient: async (id, payload) => {
        try {
            set({ loading: true, error: null });
            const { data } = await inventoryApi.updateIngredient(id, payload);
            const updated = data.data || data;

            set({
                ingredients: get().ingredients.map((i) => (i._id === id ? { ...i, ...updated } : i)),
                loading: false
            });
            return { success: true };
        } catch (error) {
            set({
                loading: false,
                error: error.response?.data?.message || error.message || "Error al actualizar ingrediente."
            });
            return { success: false };
        }
    },

    deleteIngredient: async (id) => {
        try {
            set({ loading: true, error: null });
            await inventoryApi.deleteIngredient(id);

            set({
                ingredients: get().ingredients.filter(i => i._id !== id),
                loading: false
            });
            return { success: true };
        } catch (error) {
            set({
                loading: false,
                error: error.response?.data?.message || error.message || "Error al eliminar ingrediente."
            });
            return { success: false };
        }
    }
}));