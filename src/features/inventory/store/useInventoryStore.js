import { create } from "zustand";
import * as inventoryApi from "../../../shared/api/inventory.js";

// Umbral de stock bajo (puedes moverlo a config)
export const LOW_STOCK_THRESHOLD = 10;

export const useInventoryStore = create((set, get) => ({
    inventory: [],
    loading: false,
    error: null,

    // ─── FETCH ────────────────────────────────────────────────────
    fetchInventory: async (options = {}) => {
        const { force = false } = options;
        const state = get();
        if (state.loading) return;
        if (!force && state.inventory.length > 0) return;

        set({ loading: true, error: null });
        try {
            const result = await inventoryApi.getInventory();
            set({ inventory: result.inventory || [], loading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || err.message || "Error al cargar inventario", loading: false });
        }
    },

    // ─── CREATE ───────────────────────────────────────────────────
    createRecord: async (payload) => {
        set({ loading: true, error: null });
        try {
            const { data } = await inventoryApi.createInventoryRecord(payload);
            set((state) => ({
                inventory: [...state.inventory, data],
                loading: false,
            }));
            return { success: true, record: data };
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Error al crear registro";
            set({ error: message, loading: false });
            return { success: false, error: message };
        }
    },

    // ─── UPDATE ───────────────────────────────────────────────────
    updateRecord: async (id, payload) => {
        set({ loading: true, error: null });
        try {
            const { data } = await inventoryApi.updateInventoryRecord(id, payload);
            set((state) => ({
                inventory: state.inventory.map((r) => (r.id === id ? { ...r, ...data } : r)),
                loading: false,
            }));
            return { success: true, record: data };
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Error al actualizar registro";
            set({ error: message, loading: false });
            return { success: false, error: message };
        }
    },

    // ─── ADJUST STOCK ─────────────────────────────────────────────
    adjustStock: async (id, quantity) => {
        set({ loading: true, error: null });
        try {
            const { data } = await inventoryApi.adjustStock(id, quantity);
            set((state) => ({
                inventory: state.inventory.map((r) => (r.id === id ? { ...r, ...data } : r)),
                loading: false,
            }));
            return { success: true, record: data };
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Error al ajustar stock";
            set({ error: message, loading: false });
            return { success: false, error: message };
        }
    },

    // ─── DELETE ───────────────────────────────────────────────────
    deleteRecord: async (id) => {
        set({ loading: true, error: null });
        try {
            await inventoryApi.deleteInventoryRecord(id);
            set((state) => ({
                inventory: state.inventory.filter((r) => r.id !== id),
                loading: false,
            }));
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Error al eliminar registro";
            set({ error: message, loading: false });
            return { success: false, error: message };
        }
    },

    // ─── SELECTORS ────────────────────────────────────────────────
    getLowStockItems: () => {
        return get().inventory.filter(
            (r) => r.currentStock !== undefined && r.currentStock <= LOW_STOCK_THRESHOLD
        );
    },
}));