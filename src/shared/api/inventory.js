import { axiosAuth } from "./api";

// ─── INGREDIENTES ───────────────────────────────────────────────
export const getAllIngredients = async () => {
    const { data } = await axiosAuth.get("/ingredients");
    return { ingredients: data };
};

export const getIngredientById = async (id) => {
    const { data } = await axiosAuth.get(`/ingredients/${id}`);
    return { ingredient: data };
};

export const createIngredient = async (payload) => {
    return await axiosAuth.post("/ingredients", payload);
};

export const updateIngredient = async (id, payload) => {
    return await axiosAuth.put(`/ingredients/${id}`, payload);
};

export const deleteIngredient = async (id) => {
    return await axiosAuth.delete(`/ingredients/${id}`);
};

// ─── INVENTARIO ─────────────────────────────────────────────────
export const getInventory = async () => {
    const { data } = await axiosAuth.get("/inventory");
    return { inventory: data };
};

export const getInventoryByIngredient = async (ingredientId) => {
    const { data } = await axiosAuth.get(`/inventory/ingredient/${ingredientId}`);
    return { record: data };
};

export const createInventoryRecord = async (payload) => {
    return await axiosAuth.post("/inventory", payload);
};

export const updateInventoryRecord = async (id, payload) => {
    return await axiosAuth.put(`/inventory/${id}`, payload);
};

export const adjustStock = async (id, quantity) => {
    return await axiosAuth.patch(`/inventory/${id}/adjust`, { quantity });
};

export const deleteInventoryRecord = async (id) => {
    return await axiosAuth.delete(`/inventory/${id}`);
};