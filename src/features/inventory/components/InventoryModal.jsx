import { useEffect } from "react";
import { useForm } from "react-hook-form";

export const InventoryModal = ({ isOpen, onClose, onSave, loading, record = null, ingredients = [] }) => {
    const isEditing = Boolean(record);

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
                          ingredientId: record.ingredientId,
                          currentStock: record.currentStock,
                          minimumStock: record.minimumStock,
                          maximumStock: record.maximumStock ?? "",
                          location: record.location || "",
                      }
                    : {
                          ingredientId: ingredients[0]?.id || "",
                          currentStock: 0,
                          minimumStock: 5,
                          maximumStock: "",
                          location: "",
                      }
            );
        }
    }, [isOpen, record, ingredients, reset]);

    if (!isOpen) return null;

    const submit = async (values) => {
        const payload = {
            ...values,
            currentStock: Number(values.currentStock),
            minimumStock: Number(values.minimumStock),
            maximumStock: values.maximumStock !== "" ? Number(values.maximumStock) : null,
        };
        const ok = await onSave(payload);
        if (ok) {
            reset();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-3 sm:px-4">
            <div className="bg-[#f6f1e8] rounded-2xl shadow-2xl border border-accent/20 w-full max-w-lg flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 sm:p-5 text-bg-dark bg-accent sticky top-0 z-10">
                    <h2 className="text-xl sm:text-2xl font-bold font-serif">
                        {isEditing ? "Editar Registro" : "Nuevo Registro de Inventario"}
                    </h2>
                    <p className="text-xs sm:text-sm font-semibold opacity-90 mt-1">
                        {isEditing ? "Actualiza el stock del ingrediente" : "Agrega un ingrediente al inventario"}
                    </p>
                </div>

                <form onSubmit={handleSubmit(submit)} className="p-4 sm:p-6 space-y-4 overflow-y-auto bg-[#fffaf2]">
                    {/* Ingrediente */}
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
                                    <option key={ing.id} value={ing.id}>
                                        {ing.name} ({ing.unit})
                                    </option>
                                ))}
                            </select>
                            {errors.ingredientId && (
                                <p className="text-error text-xs font-semibold mt-1">{errors.ingredientId.message}</p>
                            )}
                        </div>
                    )}

                    {/* Stock actual + mínimo */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Stock Actual *
                            </label>
                            <input
                                {...register("currentStock", {
                                    required: "Requerido",
                                    min: { value: 0, message: "No puede ser negativo" },
                                })}
                                type="number"
                                step="0.01"
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                            {errors.currentStock && (
                                <p className="text-error text-xs font-semibold mt-1">{errors.currentStock.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Stock Mínimo *
                            </label>
                            <input
                                {...register("minimumStock", {
                                    required: "Requerido",
                                    min: { value: 0, message: "No puede ser negativo" },
                                })}
                                type="number"
                                step="0.01"
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                            {errors.minimumStock && (
                                <p className="text-error text-xs font-semibold mt-1">{errors.minimumStock.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Stock máximo + ubicación */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Stock Máximo
                            </label>
                            <input
                                {...register("maximumStock", {
                                    min: { value: 0, message: "No puede ser negativo" },
                                })}
                                type="number"
                                step="0.01"
                                placeholder="Opcional"
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Ubicación
                            </label>
                            <input
                                {...register("location")}
                                type="text"
                                placeholder="Ej: Bodega A..."
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-accent/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-accent/20 bg-bg-page hover:bg-accent/10 text-text-body font-bold transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-accent text-bg-dark font-bold hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {loading ? (
                                <span className="inline-block w-4 h-4 border-2 border-bg-dark border-t-transparent rounded-full animate-spin" />
                            ) : isEditing ? "Guardar cambios" : "Agregar al inventario"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};