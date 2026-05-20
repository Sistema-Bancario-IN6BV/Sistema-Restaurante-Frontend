import { useTableStore } from "../store/useTableStore";

export const useSaveTable = () => {

    const createTable = useTableStore((state) => state.createTable);

    const updateTable = useTableStore((state) => state.updateTable);

    const saveTable = async (data, tableId = null) => {
        
        try {
            
            const tableData = {
                number: Number(data.number),
                capacity: Number(data.capacity),
                location: data.location,
                description: data.description
            };

            if (tableId) {
                await updateTable(tableId, tableData);
            } else {
                await createTable(tableData);
            }

            return { success: true };

        } catch (error) {
            return {
                error: error.response?.data?.message || "Error al guardar mesa"
            };
        }
    };

    return { saveTable}
};