import { useEffect, useState } from "react";
import { useEventStore } from "../store/useEventStore";

const statusOptions = [
    { value: "UPCOMING", label: "Próximo" },
    { value: "ONGOING", label: "En curso" },
    { value: "COMPLETED", label: "Completado" },
    { value: "CANCELLED", label: "Cancelado" }
];

export const EventModal = ({ isOpen, onClose, event, onSave }) => {
    const { loading } = useEventStore();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        capacity: 0,
        price: 0,
        status: "UPCOMING",
        services: "",
        tags: ""
    });

    useEffect(() => {
        if (event) {
            setFormData({
                title: event.title || "",
                description: event.description || "",
                date: event.date ? event.date.split("T")[0] : "",
                startTime: event.startTime || "",
                endTime: event.endTime || "",
                capacity: event.capacity || 0,
                price: event.price || 0,
                status: event.status || "UPCOMING",
                services: event.services?.join(", ") || "",
                tags: event.tags?.join(", ") || ""
            });
        } else {
            setFormData({
                title: "",
                description: "",
                date: "",
                startTime: "",
                endTime: "",
                capacity: 0,
                price: 0,
                status: "UPCOMING",
                services: "",
                tags: ""
            });
        }
    }, [event]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSend = {
            ...formData,
            capacity: parseInt(formData.capacity),
            price: parseFloat(formData.price),
            services: formData.services ? formData.services.split(",").map((s) => s.trim()) : [],
            tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : []
        };
        await onSave(dataToSend);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-base-espresso/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#F2EAE0] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#E8DFD0]">
                {}
                <div className="bg-[#1C1008] px-6 py-4 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-[#FAF6F0] font-serif">
                        {event ? "Editar Evento" : "Nuevo Evento"}
                    </h2>
                    <p className="text-[#A08060] text-sm mt-1">
                        {event ? "Actualiza los datos del evento" : " Completa los datos del nuevo evento"}
                    </p>
                </div>

                {}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {}
                    <div>
                        <label className="block text-[#3A2418] font-semibold text-sm mb-1">
                            Nombre del Evento *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-[#E8DFD0] bg-[#FAF6F0] rounded-xl text-[#3A2418] focus:outline-none focus:border-[#F5C842] transition-colors"
                            placeholder="Ej: Cena Navideña 2024"
                        />
                    </div>

                    {}
                    <div>
                        <label className="block text-[#3A2418] font-semibold text-sm mb-1">
                            Descripción
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 border border-[#E8DFD0] bg-[#FAF6F0] rounded-xl text-[#3A2418] focus:outline-none focus:border-[#F5C842] transition-colors resize-none"
                            placeholder="Descripción del evento..."
                        />
                    </div>

                    {}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[#3A2418] font-semibold text-sm mb-1">
                                Fecha *
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-[#E8DFD0] bg-[#FAF6F0] rounded-xl text-[#3A2418] focus:outline-none focus:border-[#F5C842] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[#3A2418] font-semibold text-sm mb-1">
                                Hora Inicio *
                            </label>
                            <input
                                type="time"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-[#E8DFD0] bg-[#FAF6F0] rounded-xl text-[#3A2418] focus:outline-none focus:border-[#F5C842] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[#3A2418] font-semibold text-sm mb-1">
                                Hora Fin *
                            </label>
                            <input
                                type="time"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-[#E8DFD0] bg-[#FAF6F0] rounded-xl text-[#3A2418] focus:outline-none focus:border-[#F5C842] transition-colors"
                            />
                        </div>
                    </div>

                    {}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[#3A2418] font-semibold text-sm mb-1">
                                Capacidad *
                            </label>
                            <input
                                type="number"
                                name="capacity"
                                value={formData.capacity}
                                onChange={handleChange}
                                required
                                min="1"
                                className="w-full px-4 py-2 border border-[#E8DFD0] bg-[#FAF6F0] rounded-xl text-[#3A2418] focus:outline-none focus:border-[#F5C842] transition-colors"
                                placeholder="Número de asistentes"
                            />
                        </div>
                        <div>
                            <label className="block text-[#B5541A] font-semibold text-sm mb-1">
                                Precio ($)
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 border border-[#E8DFD0] bg-[#FAF6F0] rounded-xl text-[#B5541A] focus:outline-none focus:border-[#B5541A] transition-colors"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {}
                    {event && (
                        <div>
                            <label className="block text-[#3A2418] font-semibold text-sm mb-1">
                                Estado
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-[#E8DFD0] bg-[#FAF6F0] rounded-xl text-[#3A2418] focus:outline-none focus:border-[#F5C842] transition-colors"
                            >
                                {statusOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {}
                    <div>
                        <label className="block text-[#3A2418] font-semibold text-sm mb-1">
                            Servicios (separados por coma)
                        </label>
                        <input
                            type="text"
                            name="services"
                            value={formData.services}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-[#E8DFD0] bg-[#FAF6F0] rounded-xl text-[#3A2418] focus:outline-none focus:border-[#F5C842] transition-colors"
                            placeholder="Ej: Música en vivo, Cena, Bar"
                        />
                    </div>

                    {}
                    <div>
                        <label className="block text-[#3A2418] font-semibold text-sm mb-1">
                            Tags (separados por coma)
                        </label>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-[#E8DFD0] bg-[#FAF6F0] rounded-xl text-[#3A2418] focus:outline-none focus:border-[#F5C842] transition-colors"
                            placeholder="Ej: navidad, familiar, premium"
                        />
                    </div>

                    {}
                    <div className="flex justify-end gap-3 pt-4 border-t border-[#E8DFD0]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-xl border border-[#E8DFD0] text-[#6B5040] hover:bg-[#E8DFD0] transition-colors font-semibold"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 rounded-xl bg-[#F5C842] text-[#1C1008] font-bold hover:bg-[#C8860A] shadow-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? "Guardando..." : "Guardar Evento"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
