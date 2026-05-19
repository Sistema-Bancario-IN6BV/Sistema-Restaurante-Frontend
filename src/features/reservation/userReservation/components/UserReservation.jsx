import { useEffect } from "react";

import {
    ClockIcon,
    MapPinIcon,
    UserGroupIcon
} from "@heroicons/react/24/outline";

import { useUserReservationStore }
from "../store/useUserReservationStore";

export const UserReservation = () => {

    const {
        reservations,
        getMyReservations,
        cancelReservation
    } = useUserReservationStore();

    useEffect(() => {
        getMyReservations();
    }, []);

    return (
        <div className="px-6 md:px-12 lg:px-20 py-6">

            {/* HEADER */}
            <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent/80">
                    Historial
                </p>

                <h1 className="mt-2 text-3xl font-bold text-accent font-serif">
                    Mis Reservaciones
                </h1>

                <p className="text-sm text-text-muted mt-2">
                    Consulta el estado de todas tus reservaciones.
                </p>
            </div>

            {/* SIN RESERVACIONES */}
            {reservations.length === 0 ? (
                <div className="bg-bg-card rounded-2xl border border-accent/10 shadow-lg p-10 text-center">

                    <div className="flex flex-col items-center gap-3">

                        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                            <ClockIcon className="w-8 h-8 text-accent" />
                        </div>

                        <h3 className="text-xl font-bold text-text-body">
                            No tienes reservaciones
                        </h3>

                        <p className="text-text-muted">
                            Todavía no has realizado ninguna reservación.
                        </p>
                    </div>
                </div>
            ) : (

                /* LISTADO */
                <div className="bg-bg-card rounded-2xl border border-accent/10 shadow-lg overflow-hidden">

                    <div className="divide-y divide-accent/10">

                        {reservations.map((reservation) => {

                            const isLocked =
                                reservation.status === "COMPLETED" ||
                                reservation.status === "CANCELLED";

                            return (
                                <article
                                    key={reservation._id}
                                    className="flex flex-col gap-4 px-6 py-5 hover:bg-bg-page/40 transition md:flex-row md:items-center md:justify-between"
                                >

                                    {/* IZQUIERDA */}
                                    <div className="flex items-center gap-4 min-w-0">

                                        {/* HORA */}
                                        <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-2xl bg-base-dark-roast text-white shadow-md">
                                            <ClockIcon className="h-4 w-4" />

                                            <span className="mt-1 text-xs font-bold">
                                                {reservation.time}
                                            </span>
                                        </div>

                                        {/* INFO */}
                                        <div className="min-w-0">

                                            <h3 className="text-base md:text-lg font-bold text-text-body truncate">
                                                {reservation.restaurantId?.name}
                                            </h3>

                                            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-muted">

                                                <span className="inline-flex items-center gap-1">
                                                    <MapPinIcon className="h-4 w-4 text-accent" />
                                                    Mesa {reservation.tableId?.number}
                                                </span>

                                                <span className="inline-flex items-center gap-1">
                                                    <UserGroupIcon className="h-4 w-4 text-accent" />
                                                    {reservation.guests} personas
                                                </span>

                                                <span>
                                                    {new Date(
                                                        reservation.date
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>

                                            {/* MENSAJES */}
                                            <div className="mt-3">

                                                {reservation.status === "PENDING" && (
                                                    <p className="text-xs font-medium text-yellow-700 bg-yellow-100 border border-yellow-200 px-3 py-2 rounded-xl inline-block">
                                                        Tu reservación está pendiente de confirmación.
                                                    </p>
                                                )}

                                                {reservation.status === "CONFIRMED" && (
                                                    <p className="text-xs font-medium text-green-700 bg-green-100 border border-green-200 px-3 py-2 rounded-xl inline-block">
                                                        Tu reservación fue confirmada por el restaurante.
                                                    </p>
                                                )}

                                                {reservation.status === "CANCELLED" && (
                                                    <p className="text-xs font-medium text-red-700 bg-red-100 border border-red-200 px-3 py-2 rounded-xl inline-block">
                                                        Esta reservación fue cancelada.
                                                    </p>
                                                )}

                                                {reservation.status === "COMPLETED" && (
                                                    <p className="text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200 px-3 py-2 rounded-xl inline-block">
                                                        Tu visita ya fue completada.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* DERECHA */}
                                    <div className="flex items-center justify-between gap-3 md:justify-end">

                                        {/* STATUS */}
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border whitespace-nowrap ${
                                                reservation.status === "PENDING"
                                                    ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                                    : reservation.status === "CONFIRMED"
                                                    ? "bg-green-100 text-green-700 border-green-200"
                                                    : reservation.status === "CANCELLED"
                                                    ? "bg-red-100 text-red-700 border-red-200"
                                                    : "bg-blue-100 text-blue-700 border-blue-200"
                                            }`}
                                        >
                                            {reservation.status}
                                        </span>

                                        {/* BOTON */}
                                        {!isLocked && (
                                            <button
                                                onClick={() =>
                                                    cancelReservation(
                                                        reservation._id
                                                    )
                                                }
                                                className="px-4 py-2 rounded-xl bg-bg-page border border-accent/20 hover:bg-red-100 transition text-sm font-semibold"
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};