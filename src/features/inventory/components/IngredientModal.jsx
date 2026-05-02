import { useEffect } from "react";
import { useForm } from "react-hook-form";

const UNITS = ["kg", "g", "l", "ml", "unidad", "porción", "taza", "cucharada"];

export const IngredientModal = ({ isOpen, onClose, onSave, loading, ingredient = null }) => {
    const isEditing = Boolean(ingredient);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        if (isOpen) {
            reset(
                ingredient
                    ? {
                          name: ingredient.name,
                          description: ingredient.description || "",
                          unit: ingredient.unit,
                          category: ingredient.category || "",
                      }
                    : { name: "", description: "", unit: "kg", category: "" }
            );
        }
    }, [isOpen, ingredient, reset]);

    if (!isOpen) return null;

    const submit = async (values) => {
        const ok = await onSave(values);
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
                        {isEditing ? "Editar Ingrediente" : "Nuevo Ingrediente"}
                    </h2>
                    <p className="text-xs sm:text-sm font-semibold opacity-90 mt-1">
                        {isEditing ? "Actualiza la información del ingrediente" : "Completa los datos del nuevo ingrediente"}
                    </p>
                </div>

                <form onSubmit={handleSubmit(submit)} className="p-4 sm:p-6 space-y-4 overflow-y-auto bg-[#fffaf2]">
                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                            Nombre *
                        </label>
                        <input
                            {...register("name", { required: "El nombre es obligatorio", minLength: { value: 2, message: "Mínimo 2 caracteres" } })}
                            type="text"
                            placeholder="Ej: Tomate, Harina, Aceite..."
                            className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                        />
                        {errors.name && <p className="text-error text-xs font-semibold mt-1">{errors.name.message}</p>}
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                            Descripción
                        </label>
                        <textarea
                            {...register("description")}
                            rows={2}
                            placeholder="Descripción opcional..."
                            className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Unidad */}
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Unidad *
                            </label>
                            <select
                                {...register("unit", { required: "La unidad es obligatoria" })}
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors cursor-pointer"
                            >
                                {UNITS.map((u) => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                            {errors.unit && <p className="text-error text-xs font-semibold mt-1">{errors.unit.message}</p>}
                        </div>

                        {/* Categoría */}
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Categoría
                            </label>
                            <input
                                {...register("category")}
                                type="text"
                                placeholder="Ej: Verdura, Lácteo..."
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
                            ) : isEditing ? "Guardar cambios" : "Crear ingrediente"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};