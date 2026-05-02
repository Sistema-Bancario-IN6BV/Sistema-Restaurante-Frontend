import { create } from "zustand";
import * as inventoryApi from "../../../shared/api/inventory.js";

export const useIngredientStore = create((set, get) => ({
    ingredients: [],
    loading: false,
    error: null,

    // ─── FETCH ────────────────────────────────────────────────────
    fetchIngredients: async (options = {}) => {
        const { force = false } = options;
        const state = get();
        if (state.loading) return;
        if (!force && state.ingredients.length > 0) return;

        set({ loading: true, error: null });
        try {
            const result = await inventoryApi.getAllIngredients();
            set({ ingredients: result.ingredients || [], loading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || err.message || "Error al cargar ingredientes", loading: false });
        }
    },

    // ─── CREATE ───────────────────────────────────────────────────
    createIngredient: async (payload) => {
        set({ loading: true, error: null });
        try {
            const { data } = await inventoryApi.createIngredient(payload);
            set((state) => ({
                ingredients: [...state.ingredients, data],
                loading: false,
            }));
            return { success: true, ingredient: data };
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Error al crear ingrediente";
            set({ error: message, loading: false });
            return { success: false, error: message };
        }
    },

    // ─── UPDATE ───────────────────────────────────────────────────
    updateIngredient: async (id, payload) => {
        set({ loading: true, error: null });
        try {
            const { data } = await inventoryApi.updateIngredient(id, payload);
            set((state) => ({
                ingredients: state.ingredients.map((i) => (i.id === id ? { ...i, ...data } : i)),
                loading: false,
            }));
            return { success: true, ingredient: data };
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Error al actualizar ingrediente";
            set({ error: message, loading: false });
            return { success: false, error: message };
        }
    },

    // ─── DELETE ───────────────────────────────────────────────────
    deleteIngredient: async (id) => {
        set({ loading: true, error: null });
        try {
            await inventoryApi.deleteIngredient(id);
            set((state) => ({
                ingredients: state.ingredients.filter((i) => i.id !== id),
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