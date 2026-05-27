import { useIngredientStore } from "../store/useIngredientStore";

export const useSaveIngredient = () => {
    const createIngredient = useIngredientStore((state) => state.createIngredient);
    const updateIngredient = useIngredientStore((state) => state.updateIngredient);

    const saveIngredient = async (data, ingredientId = null) => {
        const payload = {
            name: data.name,
            unit: data.unit,
            currentStock: Number(data.currentStock ?? 0),
            minStock: Number(data.minStock ?? 0),
            costPerUnit: Number(data.costPerUnit ?? 0),
            supplier: data.supplier || "",
            active: data.active !== undefined ? data.active : true,
        };

        if (ingredientId) {
            return await updateIngredient(ingredientId, payload);
        } else {
            return await createIngredient(payload);
        }
    };

    return { saveIngredient };
};