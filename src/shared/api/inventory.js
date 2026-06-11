import { axiosAdmin } from "./api";

export const getAllIngredients = async (restaurantId) => {
    const { data } = await axiosAdmin.get(`/inventory/restaurant/${restaurantId}`);
    return { ingredients: data.data || [] };
};

export const createIngredient = async (restaurantId, payload) => {
    return await axiosAdmin.post(`/inventory`, {
        restaurantId,
        name: payload.name,
        unit: payload.unit?.toUpperCase(),
        currentStock: Number(payload.currentStock ?? 0),
        minStock: Number(payload.minimumStock ?? payload.minStock ?? 0),
        costPerUnit: Number(payload.costPerUnit ?? 0),
        supplier: payload.supplier || "",
    });
};

export const updateIngredient = async (id, payload) => {
    return await axiosAdmin.put(`/inventory/${id}`, {
        name: payload.name,
        unit: payload.unit?.toUpperCase(),
        currentStock: payload.currentStock !== undefined ? Number(payload.currentStock) : undefined,
        minStock: Number(payload.minimumStock ?? payload.minStock ?? 0),
        costPerUnit: Number(payload.costPerUnit ?? 0),
        supplier: payload.supplier || "",
        active: payload.active !== undefined ? payload.active : true,
    });
};

export const deleteIngredient = async (id) => {
    return await axiosAdmin.delete(`/inventory/${id}`);
};

export const restockIngredient = async (id, quantity) => {
    return await axiosAdmin.patch(`/inventory/${id}/restock`, { quantity: Number(quantity) });
};