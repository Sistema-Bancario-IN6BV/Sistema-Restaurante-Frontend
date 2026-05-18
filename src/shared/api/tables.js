import { axiosAdmin } from "./api.js";

export const getTables = async (params = {}) => {
    const { data } = await axiosAdmin.get("/tables", { params });

    return data;
};

export const getTableById = async (id) => {
    const { data } = await axiosAdmin.get(`/tables/${id}`);

    return data;
};

export const createTable = async (tableData) => {
    const { data } = await axiosAdmin.post("/tables", tableData);

    return data;
};

export const updateTable = async (id, tableData) => {
    const { data } = await axiosAdmin.put(`/tables/${id}`, tableData);

    return data;
};

export const changeTableStatus = async (id, status) => {
    const { data } = await axiosAdmin.patch(`/tables/${id}/status`, { status });

    return data;
};

export const activateTable = async (id) => {
    const { data } = await axiosAdmin.put(`/tables/activate/${id}`);

    return data;
};

export const deactivateTable = async (id) => {
    const { data } = await axiosAdmin.put(`/tables/deactivate/${id}`);

    return data;
};
