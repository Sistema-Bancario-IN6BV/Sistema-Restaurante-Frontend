import { useEffect, useState } from "react";
import {useUserRestaurantStore} from "../store/useUserRestaurantStore";
import {useSaveUserReservations} from "../hooks/useSaveUserReservations";
import { checkReservationAvailability } from "../../../shared/api/admin";

import {
    XMarkIcon
} from "@heroicons/react/24/outline";

export const CreateUserRestaurantModal = ({isOpen, onClose, restaurant}) => {

    const {
        tables,
        getRestaurantTables,
        loading
    } = useUserRestaurantStore();

    const [form, setForm] = useState({
        table: "",
        reservationDate: "",
        time: "",
        guests: 1,
        notes: ""
    });

    const {saveReservation} = useSaveUserReservations();

    const [error, setError] = useState("");
    const [dateError, setDateError] = useState("");
    const [backendError, setBackendError] = useState("");
    const [dateError, setDateError] = useState("");

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

    const selectedTable = tables.find((table) => table._id === form.table);

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

    useEffect(() => {
        if (!form.reservationDate || !form.time) {
            setDateError("");
            return;
        }

        const now = new Date();
        const selected = new Date(`${form.reservationDate}T${form.time}`);

        if (selected < now) {
            setDateError("No puedes crear reservaciones en fechas u horas pasadas");
        } else {
            setDateError("");
        }
    }, [form.reservationDate, form.time]);

    // Si el usuario cambia la fecha, limpiar la hora para obligar a elegir una nueva
    useEffect(() => {
        // limpia la hora cuando la fecha cambia
        setForm((prev) => ({ ...prev, time: "" }));
    }, [form.reservationDate]);

    useEffect(() => {
        const checkAvailability = async () => {
            if (!form.table || !form.reservationDate || !form.time) {
                setBackendError("");
                return;
            }

            try {
                setBackendError("");
                await checkReservationAvailability({
                    tableId: form.table,
                    date: form.reservationDate,
                    time: form.time
                });
            } catch (err) {
                setBackendError(err.response?.data?.message || 'Mesa ocupada en ese horario');
            }
        };

        checkAvailability();
    }, [form.table, form.reservationDate, form.time]);

    useEffect(() => {
        if (!form.reservationDate || !form.time) {
            setDateError("");
            return;
        }

        const now = new Date();
        const selected = new Date(`${form.reservationDate}T${form.time}`);

        if (selected < now) {
            setDateError("No puedes crear reservaciones en fechas u horas pasadas");
        } else {
            setDateError("");
        }
    }, [form.reservationDate, form.time]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (error || dateError) return;

        const result = await saveReservation({
            restaurant: restaurant._id,
            table: form.table,
            reservationDate: form.reservationDate,
            time: form.time,
            guests: form.guests,
            notes: form.notes
        });

        if (result.success) {
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
                result.error
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
                                    !!error || !!dateError
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