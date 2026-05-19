import { useEffect, useState } from "react";

import {
    XMarkIcon
} from "@heroicons/react/24/outline";

import {
    useUserRestaurantStore
} from "../store/useUserRestaurantStore";

export const CreateUserRestaurantModal = ({
    isOpen,
    onClose,
    restaurant
}) => {

    const {
        tables,
        getRestaurantTables,
        createReservation,
        loading
    } = useUserRestaurantStore();

    const [form, setForm] = useState({
        table: "",
        reservationDate: "",
        time: "",
        guests: 1,
        notes: ""
    });

    const [error, setError] = useState("");

    useEffect(() => {

        if (
            isOpen &&
            restaurant?._id
        ) {
            getRestaurantTables(
                restaurant._id
            );
        }

    }, [isOpen, restaurant]);

    const selectedTable = tables.find(
        (table) =>
            table._id === form.table
    );

    useEffect(() => {

        if (
            selectedTable &&
            Number(form.guests) >
                selectedTable.capacity
        ) {

            setError(
                `La mesa solo admite ${selectedTable.capacity} personas`
            );

        } else {

            setError("");
        }

    }, [form.guests, form.table]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (error) return;

        const response =
            await createReservation({
                restaurant:
                    restaurant._id,
                table:
                    form.table,
                reservationDate:
                    form.reservationDate,
                time:
                    form.time,
                guests:
                    Number(form.guests),
                notes:
                    form.notes
            });

        if (response?.success) {

            alert(
                "Reservación creada correctamente"
            );

            setForm({
                table: "",
                reservationDate: "",
                time: "",
                guests: 1,
                notes: ""
            });

            onClose();

        } else {

            alert(
                response?.message ||
                "Error al crear reservación"
            );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">

            <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">

                {/* HEADER */}
                <div className="flex items-center justify-between bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-5">

                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            Reservar Mesa
                        </h2>

                        <p className="mt-1 text-sm text-white/90">
                            {restaurant?.name}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* FORM */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 bg-[#fffdf8] p-6"
                >

                    {/* MESA */}
                    <div>
                        <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-gray-700">
                            Mesa
                        </label>

                        <select
                            value={form.table}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    table:
                                        e.target.value
                                })
                            }
                            required
                            className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-yellow-500"
                        >
                            <option value="">
                                Selecciona una mesa
                            </option>

                            {tables
                                .sort(
                                    (a, b) =>
                                        Number(a.number) -
                                        Number(b.number)
                                )
                                .map((table) => (
                                    <option
                                        key={table._id}
                                        value={table._id}
                                    >
                                        Mesa {table.number}
                                        {" - "}
                                        {table.capacity}
                                        {" personas"}
                                    </option>
                            ))}
                        </select>
                    </div>

                    {/* FECHA Y HORA */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                        <div>
                            <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-gray-700">
                                Fecha
                            </label>

                            <input
                                type="date"
                                required
                                value={
                                    form.reservationDate
                                }
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        reservationDate:
                                            e.target.value
                                    })
                                }
                                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-yellow-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-gray-700">
                                Hora
                            </label>

                            <input
                                type="time"
                                required
                                value={form.time}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        time:
                                            e.target.value
                                    })
                                }
                                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-yellow-500"
                            />
                        </div>
                    </div>

                    {/* PERSONAS */}
                    <div>
                        <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-gray-700">
                            Personas
                        </label>

                        <input
                            type="number"
                            min="1"
                            required
                            value={form.guests}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    guests:
                                        e.target.value
                                })
                            }
                            className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-yellow-500"
                        />

                        {selectedTable && (
                            <p className="mt-2 text-xs font-semibold text-gray-500">
                                Capacidad máxima:
                                {" "}
                                {
                                    selectedTable.capacity
                                }
                                {" "}
                                personas
                            </p>
                        )}

                        {error && (
                            <p className="mt-2 text-sm font-bold text-red-500">
                                {error}
                            </p>
                        )}
                    </div>

                    {/* NOTAS */}
                    <div>
                        <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-gray-700">
                            Notas
                        </label>

                        <textarea
                            rows="4"
                            value={form.notes}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    notes:
                                        e.target.value
                                })
                            }
                            placeholder="Opcional..."
                            className="w-full resize-none rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-yellow-500"
                        />
                    </div>

                    {/* BOTONES */}
                    <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-2xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                !!error
                            }
                            className="rounded-2xl bg-yellow-500 px-6 py-3 font-bold text-white transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {
                                loading
                                    ? "Creando..."
                                    : "Confirmar Reservación"
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};