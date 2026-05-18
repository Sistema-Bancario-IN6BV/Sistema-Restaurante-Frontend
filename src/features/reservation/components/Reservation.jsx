import { useState, useEffect } from "react";
import { useReservationStore } from "../store/useReservationStore.js";
import { CreateReservationModal } from "./createReservationModal.jsx";

import {
    ClockIcon,
    EnvelopeIcon,
    MapPinIcon,
    PencilSquareIcon,
    UserGroupIcon,
} from "@heroicons/react/24/outline";

export const Reservations = () => {

    const {
        reservations,
        tables,
        getRestaurantTables,
        getReservationsForAdmin,
        cancelReservation,
        confirmReservation,
        completeReservation
    } = useReservationStore();

    const [openModal, setOpenModal] = useState(false);

    const [selectedReservation, setSelectedReservation] = useState(null);

    const [searchDate, setSearchDate] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [tableFilter, setTableFilter] = useState("ALL");

    const [currentPage, setCurrentPage] = useState(1);
    const reservationsPerPage = 6;
    
    const restaurantId = reservations?.[0]?.restaurantId?._id || reservations?.[0]?.restaurantId;

    useEffect(() => {
        getReservationsForAdmin();
        getRestaurantTables();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchDate, statusFilter, tableFilter]);

    const filteredReservations = reservations.filter((reservation) => {
        const matchesStatus =
            statusFilter === "ALL"
                ? true
                : reservation.status === statusFilter;

            const reservationDate = new Date(reservation.date)
                .toISOString()
                .split("T")[0];

            const matchesDate =
                !searchDate || reservationDate === searchDate;

            const matchesTable =
                tableFilter === "ALL"
                    ? true
                    : reservation.tableId?._id === tableFilter;

            return matchesStatus && matchesDate && matchesTable;
    });

    const totalPages = Math.ceil(filteredReservations.length / reservationsPerPage);
    const startIndex = (currentPage - 1) * reservationsPerPage;
    const endIndex = startIndex + reservationsPerPage;
    const currentReservations = filteredReservations.slice(startIndex, endIndex);

    return (
        <div className="p-4">
        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent/80">
                    Gestión de reservas
                </p>

                <h1 className="mt-2 text-3xl font-bold text-accent font-serif">
                    Reservaciones
                </h1>

                <p className="text-accent/80 mt-1 text-sm font-medium">
                    Administra reservas de tu restaurante
                </p>
            </div>

            <button
                onClick={() => {
                    setSelectedReservation(null);
                    setOpenModal(true);
                }}
                className="bg-accent px-6 py-2 rounded-xl text-bg-dark font-bold hover:bg-gold-light shadow-lg transition flex items-center justify-center gap-2"
            >
                Nueva reserva
            </button>
        </div>

        {/* FILTROS */}
        <div className="bg-bg-card border border-accent/10 rounded-2xl p-4 mb-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* FECHA */}
                <div>
                    <label className="block text-sm font-bold text-text-body mb-2 uppercase tracking-wide">
                        Filtrar por fecha
                    </label>

                    <input
                        type="date"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-accent/20 bg-bg-page"
                    />
                </div>

                {/* ESTADO */}
                <div>
                    <label className="block text-sm font-bold text-text-body mb-2 uppercase tracking-wide">
                        Filtrar por estado
                    </label>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-accent/20 bg-bg-page"
                    >
                        <option value="ALL">Todos</option>
                        <option value="PENDING">Pendiente</option>
                        <option value="CONFIRMED">Confirmada</option>
                        <option value="CANCELLED">Cancelada</option>
                        <option value="COMPLETED">Completada</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-text-body mb-2 uppercase tracking-wide">
                        Filtrar por mesa
                    </label>

                    <select
                        value={tableFilter}
                        onChange={(e) => setTableFilter(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-accent/20 bg-bg-page"
                    >
                        <option value="ALL">
                            Todas las mesas
                        </option>

                        {tables
                            .filter((table) => table.active)
                            .sort((a, b) => Number(a.number) - Number(b.number))
                            .map((table) => (
                                <option
                                    key={table._id}
                                    value={table._id}
                                >
                                    Mesa {table.number}
                                </option>
                            ))}
                    </select>
                </div>

                {/* LIMPIAR FILTRO */}
                <button
                    onClick={() => {
                        setSearchDate("");
                        setStatusFilter("ALL");
                        setTableFilter("ALL");
                    }}
                    className="px-5 py-3 rounded-xl border border-accent/20 bg-bg-page text-text-body font-semibold hover:bg-accent/10 transition"
                >
                    Limpiar filtros
                </button>
            </div>
        </div>

        {reservations.length === 0 ? (
            <div className="bg-bg-card rounded-2xl border border-accent/10 shadow-lg p-12 text-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                        <ClockIcon className="w-8 h-8 text-accent" />
                    </div>

                    <h3 className="text-xl font-bold text-text-body">
                        No hay reservaciones registradas
                    </h3>

                    <p className="text-text-muted max-w-md">
                        Todavía no existen reservaciones en el sistema.
                    </p>
                </div>
            </div>
        ) : filteredReservations.length === 0 ? (
            <div className="bg-bg-card rounded-2xl border border-accent/10 shadow-lg p-12 text-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                        <ClockIcon className="w-8 h-8 text-accent" />
                    </div>

                    <h3 className="text-xl font-bold text-text-body">
                        Sin resultados
                    </h3>

                    <p className="text-text-muted max-w-md">
                        No hay reservaciones que coincidan con los filtros seleccionados.
                    </p>
                </div>
            </div>
        ) : null}

        {/* CONTENEDOR */}
        <div className="bg-bg-card rounded-xl border border-accent/10 shadow-lg overflow-hidden">
            <div className="divide-y divide-accent/10">

                {currentReservations.map((reservation) => {
                    const isEditable = reservation.status === "PENDING";
                    const isCompleted = reservation.status === "COMPLETED";
                    const isCancelled = reservation.status === "CANCELLED";
                    const isConfirmed = reservation.status === "CONFIRMED";

                    const isLocked = isCompleted || isCancelled;

                    return (
                        <article
                            key={reservation._id}
                            className="grid gap-4 px-4 py-5 transition-colors hover:bg-bg-page/40 md:grid-cols-[90px_1.5fr_1fr_auto] md:items-center md:px-6"
                        >

                            {/* HORA */}
                            <div className="flex h-20 w-full items-center justify-center rounded-2xl bg-base-dark-roast text-white shadow-md md:w-20 md:flex-col">
                                <ClockIcon className="h-5 w-5" />
                                <span className="mt-1 text-sm font-bold">
                                    {reservation.time}
                                </span>
                            </div>

                            {/* USUARIO */}
                            <div>
                                <h3 className="text-base md:text-lg font-bold text-text-body">
                                    Usuario: {reservation.userName}
                                </h3>

                                <div className="mt-3 grid gap-2 text-sm text-text-muted sm:grid-cols-2">
                                    <span className="inline-flex items-center gap-2">
                                        <EnvelopeIcon className="h-4 w-4 text-accent" />
                                        Email: {reservation.userEmail}
                                    </span>
                                </div>
                            </div>

                            {/* DETALLES */}
                            <div className="grid gap-2 text-sm text-text-muted sm:grid-cols-2 md:grid-cols-1">

                                <span className="inline-flex items-center gap-2">
                                    <UserGroupIcon className="h-4 w-4 text-accent" />
                                    {reservation.guests} personas
                                </span>

                                <span className="inline-flex items-center gap-2">
                                    <MapPinIcon className="h-4 w-4 text-accent" />
                                    Mesa {reservation.tableId?.number}
                                </span>

                                <span>
                                    {new Date(reservation.date).toLocaleDateString()}
                                </span>

                                <div>
                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-bg-page text-text-body border border-accent/20">
                                        {reservation.status}
                                    </span>
                                </div>
                            </div>

                            {/* BOTONES */}
                            <div className="flex flex-wrap items-center gap-3 md:justify-end">

                                {/* EDITAR */}
                                {isEditable && (
                                    <button
                                        onClick={() => {
                                            setSelectedReservation(reservation);
                                            setOpenModal(true);
                                        }}
                                        className="inline-flex items-center gap-2 rounded-lg bg-bg-page/50 hover:bg-accent/10 border border-accent/20 px-4 py-2 text-xs font-semibold text-accent transition-colors"
                                    >
                                        <PencilSquareIcon className="h-4 w-4" />
                                        Editar
                                    </button>
                                )}

                                {/* CONFIRMAR */}
                                {isEditable && (
                                    <button
                                        onClick={() => confirmReservation(reservation._id)}
                                        className="px-4 py-2 rounded-lg bg-accent text-bg-dark font-semibold hover:bg-gold-light transition"
                                    >
                                        Confirmar
                                    </button>
                                )}

                                {/* CANCELAR */}
                                {!isLocked && (
                                    <button
                                        onClick={() => cancelReservation(reservation._id)}
                                        className="px-4 py-2 rounded-lg bg-bg-page text-text-body border border-accent/20 font-semibold hover:bg-red-100 transition"
                                    >
                                        Cancelar
                                    </button>
                                )}

                                {/* COMPLETAR */}
                                {isConfirmed && (
                                    <button
                                        onClick={() => completeReservation(reservation._id)}
                                        className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                                    >
                                        Completar
                                    </button>
                                )}

                                {/* BLOQUEADO */}
                                {isLocked && (
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gray-100 text-gray-600 border border-gray-300">
                                        Ya no se puede editar esta reservación
                                    </span>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>

        {/* PAGINACION */}
        {filteredReservations.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">

                <p className="text-sm text-text-muted font-medium">
                    Página {currentPage} de {totalPages}
                </p>

                <div className="flex items-center gap-2">

                    {/* BOTON ANTERIOR */}
                    <button
                        onClick={() =>
                            setCurrentPage((prev) =>
                                Math.max(prev - 1, 1)
                            )
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-xl border border-accent/20 bg-bg-card disabled:opacity-50"
                    >
                        Anterior
                    </button>

                    {/* NUMEROS */}
                    {Array.from(
                        { length: totalPages },
                        (_, index) => (
                            <button
                                key={index}
                                onClick={() =>
                                    setCurrentPage(index + 1)
                                }
                                className={`w-10 h-10 rounded-xl font-bold transition ${
                                    currentPage === index + 1
                                        ? "bg-accent text-bg-dark"
                                        : "bg-bg-card border border-accent/20"
                                }`}
                            >
                                {index + 1}
                            </button>
                        )
                    )}

                    {/* BOTON SIGUIENTE */}
                    <button
                        onClick={() =>
                            setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages)
                            )
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-xl border border-accent/20 bg-bg-card disabled:opacity-50"
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        )}
        <CreateReservationModal
            isOpen={openModal}
            onClose={() => setOpenModal(false)}
            reservation={selectedReservation}
            restaurantId={restaurantId}
        />
    </div>
    );
};