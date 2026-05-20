import { create } from "zustand";
import * as inventoryApi from "../../../shared/api/inventory.js";
import { axiosAdmin } from "../../../shared/api/api.js";

export const LOW_STOCK_THRESHOLD = 10;

// Mismo resolver que useIngredientStore
const resolveRestaurantId = async () => {
    try {
        const { useRestaurantStore } = await import("../../restaurants/store/restaurantStore.js");
        const { currentRestaurant, restaurants } = useRestaurantStore.getState();
        const cached = currentRestaurant?._id || currentRestaurant?.id
            || restaurants?.[0]?._id || restaurants?.[0]?.id;
        if (cached) return cached;
    } catch (_) {}

    const { data } = await axiosAdmin.get("/restaurants/get");
    const list = Array.isArray(data.data) ? data.data : [data.data];
    const id = list?.[0]?._id || list?.[0]?.id;
    if (!id) throw new Error("No se encontró un restaurante para este usuario");
    return id;
};

export const useInventoryStore = create((set, get) => ({
    inventory: [],
    loading: false,
    error: null,

    // El inventario ES la lista de ingredientes con su stock
    fetchInventory: async (options = {}) => {
        const { force = false } = options;
        if (get().loading) return;
        if (!force && get().inventory.length > 0) return;

        set({ loading: true, error: null });
        try {
            const restaurantId = await resolveRestaurantId();
            const result = await inventoryApi.getAllIngredients(restaurantId);
            set({ inventory: result.ingredients || [], loading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || err.message || "Error al cargar inventario", loading: false });
        }
    },

    // Crear = crear ingrediente con stock
    createRecord: async (payload) => {
        set({ loading: true, error: null });
        try {
            const restaurantId = await resolveRestaurantId();
            const { data } = await inventoryApi.createIngredient(restaurantId, {
                name: payload.ingredientName || payload.name || "Ingrediente",
                unit: payload.unit || "KG",
                currentStock: Number(payload.currentStock ?? 0),
                minStock: Number(payload.minimumStock ?? payload.minStock ?? 0),
                costPerUnit: 0,
                supplier: payload.location || "",
            });
            const record = data.data || data;
            set((state) => ({ inventory: [...state.inventory, record], loading: false }));
            return { success: true, record };
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Error al crear registro";
            set({ error: message, loading: false });
            return { success: false, error: message };
        }
    },

    // Actualizar stock mínimo/máximo
    updateRecord: async (id, payload) => {
        set({ loading: true, error: null });
        try {
            const { data } = await inventoryApi.updateIngredient(id, {
                minStock: Number(payload.minimumStock ?? payload.minStock ?? 0),
                supplier: payload.location || "",
            });
            const record = data.data || data;
            set((state) => ({
                inventory: state.inventory.map((r) => (r._id === id ? { ...r, ...record } : r)),
                loading: false,
            }));
            return { success: true, record };
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Error al actualizar registro";
            set({ error: message, loading: false });
            return { success: false, error: message };
        }
    },

    // Ajustar stock = restock
    adjustStock: async (id, quantity) => {
        set({ loading: true, error: null });
        try {
            const { data } = await inventoryApi.restockIngredient(id, quantity);
            const record = data.data || data;
            set((state) => ({
                inventory: state.inventory.map((r) => (r._id === id ? { ...r, ...record } : r)),
                loading: false,
            }));
            return { success: true, record };
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Error al ajustar stock";
            set({ error: message, loading: false });
            return { success: false, error: message };
        }
    },

    deleteRecord: async (id) => {
        set({ loading: true, error: null });
        try {
            await inventoryApi.deleteIngredient(id);
            set((state) => ({
                inventory: state.inventory.filter((r) => r._id !== id),
                loading: false,
            }));
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Error al eliminar registro";
            set({ error: message, loading: false });
            return { success: false, error: message };
        }
    },

    getLowStockItems: () => {
        return get().inventory.filter((r) => r.lowStockAlert === true);
    },
}));