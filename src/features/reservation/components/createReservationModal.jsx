import { useEffect, useState } from "react";

import { useReservationStore } from "../store/useReservationStore.js";
import { useSaveReservation } from "../hooks/useSaveReservation.jsx";
import { checkReservationAvailability } from "../../../shared/api/admin";

import { Spinner } from "../../../shared/components/layouts/Spinner";

export const CreateReservationModal = ({
    isOpen,
    onClose,
    reservation,
    restaurantId
}) => {

    const { tables, getRestaurantTables, loading } = useReservationStore();

    const { saveReservation } = useSaveReservation();

    const [form, setForm] = useState({
        tableId: "",
        date: "",
        time: "",
        guests: 1,
        notes: ""
    });

    const [error, setError] = useState("");
    const [dateError, setDateError] = useState("");
    const [backendError, setBackendError] = useState("");
    const [serverError, setServerError] = useState("");

    useEffect(() => {
        if (isOpen) {
            getRestaurantTables();
        }
    }, [isOpen]);

    useEffect(() => {
        if (reservation) {
            setForm({
                tableId:
                    reservation.tableId?._id || "",
                date: reservation.date
                    ? reservation.date.split("T")[0]
                    : "",
                time: reservation.time || "",
                guests: reservation.guests || 1,
                notes: reservation.notes || ""
            });
        } else {
            setForm({
                tableId: "",
                date: "",
                time: "",
                guests: 1,
                notes: ""
            });
        }
    }, [reservation, isOpen]);

    const selectedTable = tables.find(
        (table) => table._id === form.tableId
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
    }, [form.guests, form.tableId]);

    useEffect(() => {
        const checkAvailability = async () => {
            if (
                !form.tableId ||
                !form.date ||
                !form.time
            ) {
                return;
            }

            try {
                setBackendError("");
                
                await checkReservationAvailability({
                    tableId: form.tableId,
                    date: form.date,
                    time: form.time,
                    reservationId: reservation?._id
                });
            } catch (error) {
                setBackendError(
                    error.response?.data?.message
                );
            }
        };
        checkAvailability();
    }, [form.tableId, form.date, form.time]);

    useEffect(() => {
        if (!form.date || !form.time) {
            setDateError("");
            return;
        }

        const now = new Date();

        const selectedDateTime = new Date(`${form.date}T${form.time}` );

        if (selectedDateTime < now) {
            setDateError("No puedes crear reservaciones en fechas u horas pasadas");
        } else {
            setDateError("");
        }
    }, [form.date, form.time]);

    const handleChange = (e) => {
        setBackendError("");
        
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setServerError("");

        if (error || dateError || backendError) return;

        const result = await saveReservation(
            { ...form, restaurantId },
            reservation?._id
        );

        if (result?.error) {
            setServerError(result.error);
            return;
        }

        await getRestaurantTables();

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-3 sm:px-4">
            <div className="bg-[#f6f1e8] rounded-2xl shadow-2xl border border-accent/20 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                
                {/* HEADER */}
                <div className="p-4 sm:p-5 text-bg-dark sticky top-0 z-10 bg-accent">
                    <h2 className="text-xl sm:text-2xl font-bold font-serif">
                        {
                            reservation
                                ? "Editar Reservación"
                                : "Nueva Reservación"
                        }
                    </h2>

                    <p className="text-xs sm:text-sm font-semibold opacity-90 mt-1">
                        Completa la información
                    </p>
                </div>

                {/* FORM */}
                <form
                    onSubmit={handleSubmit}
                    className="p-4 sm:p-6 space-y-4 overflow-y-auto bg-[#fffaf2]"
                >
                    {/* MESA */}
                    <div>
                        <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                            Mesa
                        </label>

                        <select
                            name="tableId"
                            value={form.tableId}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg"
                        >

                            <option value="">
                                Selecciona una mesa
                            </option>

                            {tables
                                .sort((a, b) => Number(a.number) - Number(b.number))
                                .map((table) => (
                                    <option
                                        key={table._id}
                                        value={table._id}
                                    >
                                        Mesa {table.number} - {table.capacity} personas
                                    </option>
                            ))}
                        </select>
                    </div>

                    {/* FECHA Y HORA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Fecha
                            </label>

                            <input
                                type="date"
                                name="date"
                                value={form.date}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg"
                            />
                            {dateError && (
                                <p className="text-error text-xs font-semibold mt-1">
                                    {dateError}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Hora
                            </label>

                            <input
                                type="time"
                                name="time"
                                value={form.time}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg"
                            />
                        </div>
                    </div>

                    {/* INVITADOS */}
                    <div>
                        <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                            Invitados
                        </label>

                        <input
                            type="number"
                            min="1"
                            name="guests"
                            value={form.guests}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg"
                        />

                        {selectedTable && (
                            <p className="text-xs font-semibold text-text-muted mt-1">
                                Capacidad máxima:
                                {" "}
                                {selectedTable.capacity}
                                {" "}
                                personas
                            </p>
                        )}

                        {error && (
                            <p className="text-error text-xs font-semibold mt-1">
                                {error}
                            </p>
                        )}
                    </div>

                    {/* NOTAS */}
                    <div>
                        <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                            Notas
                        </label>
                        <textarea
                            name="notes"
                            rows="4"
                            value={form.notes}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg resize-none"
                        />
                    </div>

                    {backendError && (
                        <p className="text-error text-sm font-bold text-center">
                            {backendError}
                        </p>
                    )}

                    {serverError && (
                        <p className="text-error text-sm font-bold text-center">
                            {serverError}
                        </p>
                    )}

                    {/* BOTONES */}
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-accent/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-accent/20 bg-bg-page"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={ loading || !!error || !!dateError || !!backendError }
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-accent text-bg-dark font-bold"
                        >
                            {
                                loading
                                    ? <Spinner />
                                    : reservation
                                        ? "Guardar cambios"
                                        : "Crear reservación"
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};