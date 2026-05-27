import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSaveIngredient } from "../hooks/useSaveIngredient";
import { useIngredientStore } from "../store/useIngredientStore";
import { showSuccess, showError } from "../../../shared/utils/toast.js";

const UNITS = ["KG", "G", "LT", "ML", "UNIT", "DOZEN", "POUND", "OZ"];

export const IngredientModal = ({ isOpen, onClose, ingredient }) => {
    const isEditing = Boolean(ingredient);
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
            if (ingredient) {
                reset({
                    name: ingredient.name || "",
                    unit: ingredient.unit || "KG",
                    currentStock: ingredient.currentStock ?? 0,
                    minStock: ingredient.minStock ?? 0,
                    costPerUnit: ingredient.costPerUnit ?? 0,
                    supplier: ingredient.supplier || "",
                });
            } else {
                reset({ name: "", unit: "KG", currentStock: 0, minStock: 0, costPerUnit: 0, supplier: "" });
            }
        }
    }, [isOpen, ingredient, reset]);

    if (!isOpen) return null;

    const onSubmit = async (data) => {
        const res = await saveIngredient(data, ingredient?._id);
        if (res.success) {
            showSuccess(isEditing ? "Ingrediente actualizado" : "Ingrediente creado");
            reset();
            onClose();
        } else {
            showError("Ocurrió un error al guardar el ingrediente");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-3">
            <div className="bg-[#f6f1e8] rounded-2xl shadow-2xl border border-accent/20 w-full max-w-lg overflow-hidden">
                <div className="p-5 bg-accent text-bg-dark">
                    <h2 className="text-xl font-bold font-serif">{isEditing ? "Editar Ingrediente" : "Nuevo Ingrediente"}</h2>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4 bg-[#fffaf2]">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wide text-text-body mb-1">Nombre *</label>
                        <input 
                            {...register("name", { required: "El nombre es obligatorio" })} 
                            placeholder="Tomate, Harina..." 
                            className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent" 
                        />
                        {errors.name && <p className="text-error text-xs font-semibold mt-1">{errors.name.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wide text-text-body mb-1">Unidad *</label>
                            <select {...register("unit")} className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent cursor-pointer">
                                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wide text-text-body mb-1">Costo/Unidad</label>
                            <input type="number" step="0.01" {...register("costPerUnit")} className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wide text-text-body mb-1">Stock Actual</label>
                            <input type="number" step="0.01" {...register("currentStock")} disabled={isEditing} className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent disabled:opacity-50" />
                            {isEditing && <p className="text-xs text-text-muted mt-1">Usa "Reabastecer" para cambiar stock</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wide text-text-body mb-1">Stock Mínimo *</label>
                            <input type="number" step="0.01" {...register("minStock")} className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wide text-text-body mb-1">Proveedor</label>
                        <input {...register("supplier")} placeholder="Nombre del proveedor..." className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent" />
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2 border-t border-accent/10">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-accent/20 bg-bg-page hover:bg-accent/10 text-text-body font-bold transition-colors">Cancelar</button>
                        <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-accent text-bg-dark font-bold hover:bg-gold-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? <span className="inline-block w-4 h-4 border-2 border-bg-dark border-t-transparent rounded-full animate-spin" /> : isEditing ? "Guardar cambios" : "Crear ingrediente"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};