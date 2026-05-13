import { useEffect, useState } from "react";

import { useReservationStore } from "../store/useReservationStore.js";
import { Spinner } from "../../../shared/components/layouts/Spinner";

export const CreateReservationModal = ({
    isOpen,
    onClose,
    onSave,
    restaurantId,
    loading
}) => {

    const {
        tables,
        getRestaurantTables
    } = useReservationStore();

    const [form, setForm] = useState({
        tableId: "",
        date: "",
        time: "",
        guests: 1,
        notes: ""
    });

    const [error, setError] = useState("");

    // obtememos mesas por restaurante
    useEffect(() => {
        if (isOpen && restaurantId) {
            getRestaurantTables(restaurantId);
        }
    }, [isOpen, restaurantId]);

    // seleccionamos la mesa
    const selectedTable = tables.find(
        (table) => table._id === form.tableId
    );

    // validamos la capacidad de la mesa, oh si
    useEffect(() => {
        if ( selectedTable && Number(form.guests) > selectedTable.capacity ) {
            setError(`La mesa solo admite ${selectedTable.capacity} personas`);
        } else {
            setError("");
        }
    }, [form.guests, form.tableId]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (error) return;
        await onSave({
            restaurant: restaurantId,
            table: form.tableId,
            reservationDate: form.date,
            time: form.time,
            guests: form.guests,
            notes: form.notes
        });

        setForm({
            tableId: "",
            date: "",
            time: "",
            guests: 1,
            notes: ""
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-3 sm:px-4">
            <div className="bg-[#f6f1e8] rounded-2xl shadow-2xl border border-accent/20 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* HEADER */}
                <div className="p-4 sm:p-5 text-bg-dark sticky top-0 z-10 bg-accent">
                    <h2 className="text-xl sm:text-2xl font-bold font-serif">
                        Nueva Reservación
                    </h2>

                    <p className="text-xs sm:text-sm font-semibold opacity-90 mt-1">
                        Completa la información para registrar una nueva reservación
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
                            className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors cursor-pointer"
                        >
                            <option value="">
                                Selecciona una mesa
                            </option>

                            {tables.map((table) => (
                                <option
                                    key={table._id}
                                    value={table._id}
                                >
                                    Mesa {table.number} | Capacidad de: {table.capacity} personas
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* FECHA Y HORA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* FECHA */}
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
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                        </div>

                        {/* HORA */}
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
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
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
                            placeholder="Número de invitados"
                            className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                        />

                        {selectedTable && (
                            <p className="text-xs font-semibold text-text-muted mt-1">
                                Capacidad máxima: {selectedTable.capacity} personas
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
                            placeholder="Observaciones o detalles..."
                            className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors resize-none"
                        />
                    </div>

                    {/* ERROR */}
                    {error && (
                        <p className="text-error text-sm font-bold text-center">
                            {error}
                        </p>
                    )}

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
                            disabled={loading || !!error}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-accent text-bg-dark font-bold hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >

                            {loading ? (
                                <Spinner />
                            ) : (
                                "Crear reservación"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};