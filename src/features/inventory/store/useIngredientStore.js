import { create } from "zustand";
import * as inventoryApi from "../../../shared/api/inventory.js";
import { axiosAdmin } from "../../../shared/api/api.js";

// Llama directo al backend — para RESTAURANT_ADMIN devuelve sus restaurantes automáticamente por JWT
const resolveRestaurantId = async () => {
    // 1. Intentar desde el restaurantStore si ya está cargado
    try {
        const { useRestaurantStore } = await import("../../restaurants/store/restaurantStore.js");
        const { currentRestaurant, restaurants } = useRestaurantStore.getState();
        const cached = currentRestaurant?._id || currentRestaurant?.id
            || restaurants?.[0]?._id || restaurants?.[0]?.id;
        if (cached) return cached;
    } catch (_) {}

    // 2. Llamar directo al backend
    const { data } = await axiosAdmin.get("/restaurants/get");
    // response: { success, data: [...] } o { success, data: restaurant }
    const list = Array.isArray(data.data) ? data.data : [data.data];
    const id = list?.[0]?._id || list?.[0]?.id;
    if (!id) throw new Error("No se encontró un restaurante para este usuario");
    return id;
};

export const useIngredientStore = create((set, get) => ({
    ingredients: [],
    loading: false,
    error: null,

    fetchIngredients: async (options = {}) => {
        const { force = false } = options;
        if (get().loading) return;
        if (!force && get().ingredients.length > 0) return;

        set({ loading: true, error: null });
        try {
            const restaurantId = await resolveRestaurantId();
            const result = await inventoryApi.getAllIngredients(restaurantId);
            set({ ingredients: result.ingredients || [], loading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || err.message || "Error al cargar ingredientes", loading: false });
        }
    },

    createIngredient: async (payload) => {
        set({ loading: true, error: null });
        try {
            const restaurantId = await resolveRestaurantId();
            const { data } = await inventoryApi.createIngredient(restaurantId, payload);
            const ingredient = data.data || data;
            set((state) => ({ ingredients: [...state.ingredients, ingredient], loading: false }));
            return { success: true, ingredient };
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Error al crear ingrediente";
            set({ error: message, loading: false });
            return { success: false, error: message };
        }
    },

    updateIngredient: async (id, payload) => {
        set({ loading: true, error: null });
        try {
            const { data } = await inventoryApi.updateIngredient(id, payload);
            const ingredient = data.data || data;
            set((state) => ({
                ingredients: state.ingredients.map((i) => (i._id === id ? { ...i, ...ingredient } : i)),
                loading: false,
            }));
            return { success: true, ingredient };
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Error al actualizar ingrediente";
            set({ error: message, loading: false });
            return { success: false, error: message };
        }
    },

    deleteIngredient: async (id) => {
        set({ loading: true, error: null });
        try {
            await inventoryApi.deleteIngredient(id);
            set((state) => ({
                ingredients: state.ingredients.filter((i) => i._id !== id),
                loading: false,
            }));
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Error al eliminar ingrediente";
            set({ error: message, loading: false });
            return { success: false, error: message };
        }
    },
}));