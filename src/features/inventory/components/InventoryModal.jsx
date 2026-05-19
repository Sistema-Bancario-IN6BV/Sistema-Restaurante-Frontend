import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSaveIngredient } from "../../ingredients/hooks/useSaveIngredient.js";
import { useIngredientStore } from "../../ingredients/store/useIngredientStore.js";
import { showSuccess, showError } from "../../../shared/utils/toast.js";

export const InventoryModal = ({ isOpen, onClose, record = null, ingredients = [] }) => {
    const isEditing = Boolean(record);
    const { saveIngredient } = useSaveIngredient();
    const loading = useIngredientStore((state) => state.loading);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        if (isOpen) {
            reset(
                record
                    ? {
                          ingredientId: record._id,
                          currentStock: record.currentStock,
                          minStock: record.minStock,
                          costPerUnit: record.costPerUnit || 0,
                          supplier: record.supplier || "",
                          active: record.active !== false,
                      }
                    : {
                          ingredientId: ingredients[0]?._id || "",
                          currentStock: 0,
                          minStock: 5,
                          costPerUnit: 0,
                          supplier: "",
                          active: true,
                      }
            );
        }
    }, [isOpen, record, ingredients, reset]);

    if (!isOpen) return null;

    const onSubmit = async (values) => {
        const targetId = record?._id || values.ingredientId;
        const refIngredient = ingredients.find(ing => ing._id === targetId) || record || {};

        const payload = {
            name: refIngredient.name,
            unit: refIngredient.unit,
            currentStock: Number(values.currentStock),
            minStock: Number(values.minStock),
            costPerUnit: Number(values.costPerUnit),
            supplier: values.supplier,
            active: values.active,
        };

        const res = await saveIngredient(payload, targetId);
        
        if (res.success) {
            showSuccess("Inventario actualizado correctamente");
            reset();
            onClose();
        } else {
            showError("No se pudo guardar el registro");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-3 sm:px-4">
            <div className="bg-[#f6f1e8] rounded-2xl shadow-2xl border border-accent/20 w-full max-w-lg flex flex-col overflow-hidden">
                <div className="p-4 sm:p-5 text-bg-dark bg-accent sticky top-0 z-10">
                    <h2 className="text-xl sm:text-2xl font-bold font-serif">
                        {isEditing ? "Ajustar Detalles de Stock" : "Nuevo Registro de Inventario"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 overflow-y-auto bg-[#fffaf2]">
                    {!isEditing && (
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Ingrediente *
                            </label>
                            <select
                                {...register("ingredientId", { required: "Selecciona un ingrediente" })}
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors cursor-pointer"
                            >
                                <option value="">-- Seleccionar --</option>
                                {ingredients.map((ing) => (
                                    <option key={ing._id} value={ing._id}>
                                        {ing.name} ({ing.unit})
                                    </option>
                                ))}
                            </select>
                            {errors.ingredientId && <p className="text-error text-xs font-semibold mt-1">{errors.ingredientId.message}</p>}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Stock Actual *
                            </label>
                            <input
                                {...register("currentStock", { required: "Requerido", min: { value: 0, message: "No negativo" } })}
                                type="number" step="0.01"
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                            {errors.currentStock && <p className="text-error text-xs font-semibold mt-1">{errors.currentStock.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Stock Mínimo *
                            </label>
                            <input
                                {...register("minStock", { required: "Requerido", min: { value: 0, message: "No negativo" } })}
                                type="number" step="0.01"
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                            {errors.minStock && <p className="text-error text-xs font-semibold mt-1">{errors.minStock.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Costo Unitario
                            </label>
                            <input
                                {...register("costPerUnit", { min: { value: 0, message: "No negativo" } })}
                                type="number" step="0.01"
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                            {errors.costPerUnit && <p className="text-error text-xs font-semibold mt-1">{errors.costPerUnit.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">Proveedor</label>
                            <input {...register("supplier")} type="text" placeholder="Ej: Distribuidora A..." className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 py-2">
                        <input {...register("active")} type="checkbox" id="active" className="w-5 h-5 accent-accent cursor-pointer" />
                        <label htmlFor="active" className="text-sm font-bold text-text-body cursor-pointer">Mantener ingrediente activo</label>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-accent/10">
                        <button type="button" onClick={onClose} className="w-full sm:w-auto px-6 py-3 rounded-xl border border-accent/20 bg-bg-page hover:bg-accent/10 text-text-body font-bold transition-colors">Cancelar</button>
                        <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-3 rounded-xl bg-accent text-bg-dark font-bold hover:bg-gold-light transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                            {loading ? <span className="inline-block w-4 h-4 border-2 border-bg-dark border-t-transparent rounded-full animate-spin" /> : "Guardar cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};