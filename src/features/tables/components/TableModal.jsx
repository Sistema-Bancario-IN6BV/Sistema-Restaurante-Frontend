import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";

import { Spinner } from "../../../shared/components/layouts/Spinner.jsx";

import { useSaveTable } from "../hooks/useSaveTable";

import { useTableStore } from "../store/useTableStore";

export const TableModal = ({
    isOpen,
    onClose,
    table
}) => {

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm();

    const { saveTable } = useSaveTable();

    const loading = useTableStore((state) => state.loading);

    const tables = useTableStore((state) => state.tables);

    const [serverError, setServerError] = useState("");

    useEffect(() => {
        setServerError("");
        
        if (isOpen) {
            if (table) {
                reset({
                    number: table.number,
                    capacity: table.capacity,
                    location: table.location,
                    description: table.description
                });
            } else {
                reset({
                    number: "",
                    capacity: "",
                    location: "INTERIOR",
                    description: ""
                });
            }
        }
    }, [isOpen, table]);

    const onSubmit = async (data) => {
        setServerError("");

        const result = await saveTable(data, table?._id);

        if(result?.error){
            setServerError(result.error);
            return;
        }

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-3 sm:px-4">

            <div className="bg-[#f6f1e8] rounded-2xl shadow-2xl border border-accent/20 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* HEADER */}
                <div className="p-4 sm:p-5 text-bg-dark sticky top-0 z-10 bg-accent">

                    <h2 className="text-xl sm:text-2xl font-bold font-serif">
                        {table ? "Editar Mesa" : "Nueva Mesa"}
                    </h2>

                    <p className="text-xs sm:text-sm font-semibold opacity-90 mt-1">
                        Completa la información de la mesa
                    </p>
                </div>

                {/* FORM */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="p-4 sm:p-6 space-y-4 overflow-y-auto bg-[#fffaf2]"
                >

                    {/* NUMERO Y CAPACIDAD */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* NUMERO */}
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Número de mesa
                            </label>
                            
                            <input
                                type="number"
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg"
                                {...register("number", {
                                    required: "El número es obligatorio",
                                    min: {
                                        value: 1,
                                        message: "Debe ser mayor a 0"
                                    },
                                    validate: (value) => {

                                        const exists = tables.some(
                                            (t) =>
                                                t.number === Number(value) &&
                                                t._id !== table?._id
                                        );

                                        return !exists || "Ese número de mesa ya existe";
                                    }
                                })}
                            />

                            {errors.number && (
                                <p className="text-error text-xs mt-1">
                                    {errors.number.message}
                                </p>
                            )}

                            {serverError && (
                                <p className="text-error text-xs mt-1">
                                    {serverError}
                                </p>
                            )}  

                        </div>

                        {/* CAPACIDAD */}
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Capacidad
                            </label>

                            <input
                                type="number"
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg"
                                {...register("capacity", {
                                    required: "La capacidad es obligatoria",
                                    min: {
                                        value: 1,
                                        message: "Mínimo 1"
                                    },
                                    max: {
                                        value: 20,
                                        message: "Máximo 20"
                                    }
                                })}
                            />

                            {errors.capacity && (
                                <p className="text-error text-xs mt-1">
                                    {errors.capacity.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* UBICACION */}
                    <div>
                        <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                            Ubicación
                        </label>

                        <select
                            className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg"
                            {...register("location")}
                        >
                            <option value="INTERIOR">Interior</option>
                            <option value="EXTERIOR">Exterior</option>
                            <option value="TERRACE">Terraza</option>
                            <option value="PRIVATE_ROOM">Sala privada</option>
                        </select>
                    </div>

                    {/* DESCRIPCION */}
                    <div>
                        <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                            Descripción
                        </label>

                        <textarea
                            rows="4"
                            className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg resize-none"
                            {...register("description")}
                        />
                    </div>

                    {/* BOTONES */}
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
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-accent text-bg-dark font-bold hover:bg-gold-light transition-colors flex justify-center items-center"
                        >
                            {loading ? (
                                <Spinner />
                            ) : table ? (
                                "Guardar cambios"
                            ) : (
                                "Crear mesa"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};