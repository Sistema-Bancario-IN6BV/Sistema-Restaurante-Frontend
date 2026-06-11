import { create } from "zustand";

import {
    getTables as getTablesRequest,
    createTable as createTableRequest,
    updateTable as updateTableRequest,
    deactivateTable as deactivateTableRequest,
    activateTable as activateTableRequest,
    changeTableStatus as changeTableStatusRequest
} from "../../../shared/api";

export const useTableStore = create((set, get) => ({

    tables: [],
    loading: false,
    error: null,

    getTables: async () => {
        try {

            set({
                loading: true,
                error: null
            });

            const response = await getTablesRequest();

            set({
                tables: response.tables,
                loading: false
            });

        } catch (error) {

            set({
                loading: false,
                error: error.response?.data?.message || "Error al obtener mesas"
            });
        }
    },

    createTable: async (data) => {
        try {

            set({
                loading: true,
                error: null
            });

            const response = await createTableRequest(data);

            set({
                tables: [response.table, ...get().tables],
                loading: false
            });

        } catch (error) {

            set({
                loading: false,
                error: error.response?.data?.message || "Error al crear mesa"
            });
        }
    },

    updateTable: async (id, data) => {
        try {

            set({
                loading: true,
                error: null
            });

            const response = await updateTableRequest(id, data);

            set({
                tables: get().tables.map((table) =>
                    table._id === id
                        ? response.updatedTable
                        : table
                ),
                loading: false
            });

        } catch (error) {

            set({
                loading: false,
                error: error.response?.data?.message || "Error al actualizar mesa"
            });
        }
    },

    deactivateTable: async (id) => {
        try {

            set({
                loading: true,
                error: null
            });

            await deactivateTableRequest(id);

            set({
                tables: get().tables.filter((table) => table._id !== id),
                loading: false
            });

        } catch (error) {

            set({
                loading: false,
                error: error.response?.data?.message || "Error al desactivar mesa"
            });
        }
    },

    activateTable: async (id) => {
        try {

            await activateTableRequest(id);

        } catch (error) {

            set({
                error: error.response?.data?.message || "Error al activar mesa"
            });
        }
    },

    changeTableStatus: async (id, status) => {
        try {

            const response = await changeTableStatusRequest(id, status);

            set({
                tables: get().tables.map((table) =>
                    table._id === id
                        ? response.table
                        : table
                )
            });

        } catch (error) {

            set({
                error: error.response?.data?.message || "Error al cambiar estado"
            });
        }
    }
}));