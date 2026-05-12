import { useEffect, useMemo, useState } from "react";
import { useEventStore } from "../store/useEventStore";
import { useRestaurantStore } from "../../restaurants/store/restaurantStore.js";
import { useAuthStore } from "../../auth/store/authStore.js";
import { Spinner } from "../../../shared/components/layouts/Spinner.jsx";
import { showError, showSuccess } from "../../../shared/utils/toast.js";
import { EventModal } from "../components/EventModal.jsx";

const PAGE_SIZE = 8;

const statusBadgeClass = {
    UPCOMING: "bg-[#F5C842]/20 text-[#C8860A] border border-[#C8860A]/30",
    ONGOING: "bg-[#2E7D5A]/20 text-[#2E7D5A] border border-[#2E7D5A]/30",
    COMPLETED: "bg-[#6B5040]/20 text-[#6B5040] border border-[#6B5040]/30",
    CANCELLED: "bg-[#B5541A]/20 text-[#B5541A] border border-[#B5541A]/30",
};

export const Events = () => {
    const { events, loading, error, fetchEvents, createEvent, updateEvent, cancelEvent, deleteEvent } = useEventStore();
    const { restaurants, fetchRestaurantsByAdmin } = useRestaurantStore();
    const userId = useAuthStore((state) => state.userId);
    const currentRestaurantId = useRestaurantStore((state) => state.currentRestaurant?.id);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [openModal, setOpenModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedRestaurantId, setSelectedRestaurantId] = useState("");

// cargar restaurantes del admin al iniciar
    useEffect(() => {
        if (userId) {
            fetchRestaurantsByAdmin(userId);
        }
    }, [userId, fetchRestaurantsByAdmin]);
    
    // establecer el primer restaurante por defecto cuando carguen
    useEffect(() => {
        if (restaurants.length > 0 && !selectedRestaurantId) {
setSelectedRestaurantId(restaurants[0]?._id || "");
        }
    }, [restaurants, selectedRestaurantId]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    useEffect(() => {
        if (error) {
            showError(error);
        }
    }, [error]);

    const filteredEvents = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        return events.filter((e) => {
            const title = (e.title || "").toLowerCase();
            const matchesSearch = !normalizedSearch || title.includes(normalizedSearch);
            const matchesStatus = statusFilter === "ALL" ? true : e.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [events, search, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);

    const paginatedEvents = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredEvents.slice(start, start + PAGE_SIZE);
    }, [filteredEvents, currentPage]);

    const handleOpenCreate = () => {
        setSelectedEvent(null);
        setOpenModal(true);
    };

    const handleOpenEdit = (event) => {
        setSelectedEvent(event);
        setOpenModal(true);
    };

const handleSave = async (formData) => {
        setActionLoading(true);
        let result;
        
        if (selectedEvent) {
            // Editar evento existente
            result = await updateEvent(selectedEvent.id, formData);
        } else {
            // Crear nuevo evento - incluir restaurantId
const restaurantId = selectedRestaurantId || restaurants[0]?._id;
            console.log("Creating event with restaurantId:", restaurantId, "restaurants:", restaurants);
            
            if (!restaurantId) {
                setActionLoading(false);
                showError("No tienes restaurantes asignados. Crea uno primero.");
                return;
            }
            
            const dataWithRestaurant = {
                ...formData,
                restaurantId: restaurantId
            };
            console.log("Form data sent:", dataWithRestaurant);
            result = await createEvent(dataWithRestaurant);
        }

        setActionLoading(false);

        if (result.success) {
            showSuccess(selectedEvent ? "Evento actualizado" : "Evento creado");
            setOpenModal(false);
            setSelectedEvent(null);
            await fetchEvents({ force: true });
        } else {
            showError(result.error || "No se pudo guardar el evento");
        }
    };

    const handleCancel = async (event) => {
        if (!confirm(`¿Cancelar el evento "${event.title}"?`)) return;
        setActionLoading(true);
        const result = await cancelEvent(event.id, "Cancelado por el administrador");
        setActionLoading(false);
        if (result.success) {
            showSuccess("Evento cancelado");
            await fetchEvents({ force: true });
        } else {
            showError(result.error || "No se pudo cancelar el evento");
        }
    };

    const handleDelete = async (event) => {
        if (!confirm(`¿Eliminar definitivamente el evento "${event.title}"?`)) return;
        setActionLoading(true);
        const result = await deleteEvent(event.id);
        setActionLoading(false);
        if (result.success) {
            showSuccess("Evento eliminado");
            await fetchEvents({ force: true });
        } else {
            showError(result.error || "No se pudo eliminar el evento");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <div className="p-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#C8860A] font-serif">
                        Gestión de Eventos Especiales
                    </h1>
                    <p className="text-[#C8860A]/80 mt-1 text-sm font-medium">
                        Administra los eventos de tu restaurante
                    </p>
                </div>

                <button
                    className="bg-[#F5C842] px-6 py-2 rounded-xl text-[#1C1008] font-bold hover:bg-[#C8860A] shadow-lg transition flex items-center gap-2"
                    onClick={handleOpenCreate}
                >
                    + Nuevo Evento
                </button>
            </div>

            {/* Filtros */}
            <div className="bg-[#F2EAE0] rounded-xl border border-[#E8DFD0] shadow-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Buscar por nombre del evento..."
                        className="w-full px-4 py-2 border border-[#E8DFD0] bg-[#FAF6F0] rounded-xl text-[#3A2418] focus:outline-none focus:border-[#F5C842] transition-colors"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="w-full px-4 py-2 border border-[#E8DFD0] bg-[#FAF6F0] rounded-xl text-[#3A2418] focus:outline-none focus:border-[#F5C842] transition-colors cursor-pointer"
                    >
                        <option value="ALL">Todos los estados</option>
                        <option value="UPCOMING">Próximo</option>
                        <option value="ONGOING">En curso</option>
                        <option value="COMPLETED">Completado</option>
                        <option value="CANCELLED">Cancelado</option>
                    </select>
                </div>
            </div>

            {/* Tabla */}
            {loading && !actionLoading ? (
                <div className="flex justify-center py-12">
                    <Spinner />
                </div>
            ) : (
                <div className="bg-[#F2EAE0] rounded-xl border border-[#E8DFD0] shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            {/* Head */}
                            <thead className="bg-[#FAF6F0]/50 text-[#3A2418] border-b border-[#E8DFD0]">
                                <tr>
                                    <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">
                                        Evento
                                    </th>
                                    <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">
                                        Fecha
                                    </th>
                                    <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">
                                        Capacidad
                                    </th>
                                    <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">
                                        Estado
                                    </th>
                                    <th className="text-right px-6 py-4 font-semibold uppercase tracking-wider text-xs">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>

                            {/* Body */}
                            <tbody className="divide-y divide-[#E8DFD0]">
                                {paginatedEvents.length === 0 ? (
                                    <tr>
                                        <td
                                            className="px-6 py-8 text-center text-[#6B5040]"
                                            colSpan={5}
                                        >
                                            No hay eventos para mostrar.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedEvents.map((event) => (
                                        <tr
                                            key={event.id}
                                            className="hover:bg-[#FAF6F0]/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-[#3A2418]">
                                                    {event.title}
                                                </div>
                                                {event.description && (
                                                    <div className="text-xs text-[#6B5040] mt-1 truncate max-w-xs">
                                                        {event.description}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-[#3A2418]">
                                                {formatDate(event.date)}
                                                <div className="text-xs text-[#6B5040]">
                                                    {event.startTime} - {event.endTime}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-[#3A2418]">
                                                <div className="font-semibold">
                                                    {event.registeredCount || 0}/{event.capacity}
                                                </div>
                                                <div className="text-xs text-[#6B5040]">
                                                    {event.availableSpots > 0
                                                        ? `${event.availableSpots} disponibles`
                                                        : "Lleno"}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                                        statusBadgeClass[event.status] ||
                                                        "bg-[#FAF6F0] text-[#6B5040] border border-[#E8DFD0]"
                                                    }`}
                                                >
                                                    {event.status}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {event.status !== "CANCELLED" && (
                                                        <button
                                                            className="p-2 rounded-lg hover:bg-[#C8860A]/10 text-[#C8860A] transition-colors"
                                                            onClick={() => handleOpenEdit(event)}
                                                            title="Editar"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={1.5}
                                                                stroke="currentColor"
                                                                className="w-5 h-5"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                                                />
                                                            </svg>
                                                        </button>
                                                    )}
                                                    {event.status !== "CANCELLED" &&
                                                        event.status !== "COMPLETED" && (
                                                            <button
                                                                className="p-2 rounded-lg hover:bg-[#B5541A]/10 text-[#B5541A] transition-colors"
                                                                onClick={() => handleCancel(event)}
                                                                title="Cancelar"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={1.5}
                                                                    stroke="currentColor"
                                                                    className="w-5 h-5"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M6 18L18 6M6 6l12 12"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    <button
                                                        className="p-2 rounded-lg hover:bg-[#B5541A]/10 text-[#B5541A] transition-colors"
                                                        onClick={() => handleDelete(event)}
                                                        title="Eliminar"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="w-5 h-5"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="m14.74 9-.346 9m-.346 9a2.25 2.25 0 0 1-3.363 0 2.25 2.25 0 0 1 0-3.363m12.728 0a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25m12.728 0a2.25 2.25 0 0 1-2.25-2.25H6.75a2.25 2.25 0 0 1-2.25 2.25"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-[#E8DFD0] bg-[#FAF6F0]/20">
                        <p className="text-xs text-[#6B5040]">
                            {" "}Mostrando {" "}
                            {(currentPage - 1) * PAGE_SIZE + (paginatedEvents.length ? 1 : 0)}
                            {" - "}
                            {(currentPage - 1) * PAGE_SIZE + paginatedEvents.length} de{" "}
                            {filteredEvents.length}
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-lg border border-[#E8DFD0] bg-[#FAF6F0] hover:bg-[#F5C842]/10 text-[#3A2418] text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Anterior
                            </button>

                            <span className="px-4 py-2 text-sm font-semibold text-[#3A2418]">
                                {currentPage} / {totalPages}
                            </span>

                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-lg border border-[#E8DFD0] bg-[#FAF6F0] hover:bg-[#F5C842]/10 text-[#3A2418] text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <EventModal
                isOpen={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setSelectedEvent(null);
                }}
                event={selectedEvent}
                onSave={handleSave}
            />
        </div>
    );
};
