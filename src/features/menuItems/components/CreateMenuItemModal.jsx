import { useForm } from "react-hook-form";
import { useEffect, useState, useRef } from "react";
import { Spinner } from "../../../shared/components/layouts/Spinner";
import { MENU_TYPES, MENU_TYPE_LABELS } from "../../../shared/constants/menuTypes";

export const CreateMenuItemModal = ({ isOpen, onClose, onCreate, loading }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const [allergens, setAllergens] = useState("");
    const fileRef = useRef(null);

    if (!isOpen) return null;

    const submit = async (values) => {
        const payload = {
            name: values.name || "",
            description: values.description || "",
            type: values.type || "",
            price: Number(values.price || 0),
            ingredients: values.ingredients
                ? values.ingredients.split(",").map((item) => item.trim()).filter(Boolean)
                : [],
            allergens: allergens.split(",").map((item) => item.trim()).filter(Boolean),
        };

        const ok = await onCreate(payload, fileRef.current);
        if (ok) {
            reset();
            setAllergens("");
            fileRef.current = null;
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-3 sm:px-4">
            <div className="bg-[#f6f1e8] rounded-2xl shadow-2xl border border-accent/20 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="p-4 sm:p-5 text-bg-dark sticky top-0 z-10 bg-accent">
                    <h2 className="text-xl sm:text-2xl font-bold font-serif">Nuevo Plato</h2>
                    <p className="text-xs sm:text-sm font-semibold opacity-90 mt-1">
                        Completa la información del plato para agregarlo al menú
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit(submit)}
                    className="p-4 sm:p-6 space-y-4 overflow-y-auto bg-[#fffaf2]"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Nombre del Plato
                            </label>
                            <input
                                {...register("name", { required: "El nombre es obligatorio" })}
                                type="text"
                                placeholder="Ej: Ceviche de camarón"
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                            {errors.name && (
                                <p className="text-error text-xs font-semibold mt-1">{errors.name.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Tipo
                            </label>
                            <select
                                {...register("type", { required: "El tipo es obligatorio" })}
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors cursor-pointer"
                            >
                                <option value="">Selecciona un tipo</option>
                                {MENU_TYPES.map((type) => (
                                    <option key={type} value={type}>{MENU_TYPE_LABELS[type] || type}</option>
                                ))}
                            </select>
                            {errors.type && (
                                <p className="text-error text-xs font-semibold mt-1">{errors.type.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                            Descripción
                        </label>
                        <textarea
                            {...register("description")}
                            placeholder="Describe el plato, ingredientes principales, etc."
                            className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors resize-none h-24"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Precio (GTQ)
                            </label>
                            <input
                                {...register("price", {
                                    required: "El precio es obligatorio",
                                    pattern: {
                                        value: /^[0-9]+(\.[0-9]{1,2})?$/,
                                        message: "Debe ser un número válido",
                                    },
                                })}
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                            {errors.price && (
                                <p className="text-error text-xs font-semibold mt-1">{errors.price.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Imagen
                            </label>
                            <input
                                {...register("image")}
                                type="file"
                                accept="image/*"
                                onChange={(e) => { fileRef.current = e.target.files?.[0] || null }}
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-bg-dark hover:file:bg-gold-light"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Ingredientes (separados por comas)
                            </label>
                            <input
                                {...register("ingredients")}
                                type="text"
                                placeholder="Camarón, lima, cebolla, cilantro"
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Alérgenos (separados por comas)
                            </label>
                            <input
                                value={allergens}
                                onChange={(e) => setAllergens(e.target.value)}
                                type="text"
                                placeholder="Mariscos, gluten"
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                        </div>
                    </div>

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
                            {loading ? <Spinner /> : "Crear plato"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
