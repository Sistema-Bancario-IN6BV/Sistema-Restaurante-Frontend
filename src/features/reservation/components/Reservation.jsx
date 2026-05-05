import { useEffect } from "react";
import { useReservationStore } from "../store/useReservationStore.js";
import { Spinner } from "../../../shared/components/layouts/Spinner.jsx";
import { useEffect as useToastEffect } from "react";
import { showError } from "../../../shared/utils/toast.js";

import {
    ClockIcon,
    EnvelopeIcon,
    MapPinIcon,
    PencilSquareIcon,
    PhoneIcon,
    TrashIcon,
    UserGroupIcon,
} from "@heroicons/react/24/outline";

export const Reservations = () => {
    const { reservations, loading, error, getReservations } =
        useReservationStore();

    useEffect(() => {
        getReservations();
    }, [getReservations]);

    useToastEffect(() => {
        if (error) showError(error);
    }, [error]);

    if (loading) return <Spinner />;

    return (
        <div className="min-h-[calc(100vh-8rem)] rounded-4xl border border-accent/10 bg-bg-page/70 p-4 md:p-6">
        
        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-text-muted">
                    Gestión de reservas
                </p>
                <h1 className="mt-2 font-serif text-3xl font-bold text-text-body md:text-4xl">
                    Reservaciones
                </h1>
                <p className="mt-2 text-sm text-text-muted">
                    Administra reservas de tu restaurante
                </p>
            </div>

            <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 font-semibold text-base-espresso">
                Nueva reserva
            </button>
        </div>

        {/* LISTA */}
        <section className="mt-5 overflow-hidden rounded-4xl border border-accent/10 bg-bg-card/85">

            <div className="divide-y divide-parchment/80">
            {reservations.map((reservation) => (
                <article
                    key={reservation._id}
                    className="grid gap-4 px-4 py-4 md:grid-cols-[90px_1.4fr_1fr_auto] md:items-center md:px-6"
                >
                {/* HORA */}
                <div className="flex h-20 w-full items-center justify-center rounded-2xl bg-base-dark-roast text-white md:w-20 md:flex-col">
                    <ClockIcon className="h-5 w-5" />
                    <span className="mt-1 text-sm font-bold">
                        {reservation.time}
                    </span>
                </div>

                {/* INFOMACION DEL CLIENTE */}
                <div>
                    <h3 className="text-base font-bold text-text-body md:text-lg">
                        Usuario: {reservation.userId?.name || reservation.userId}
                    </h3>

                    <div className="mt-2 grid gap-2 text-sm text-text-muted sm:grid-cols-2">
                    <span className="inline-flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4" />
                        {reservation.userId?.phone || "Sin teléfono"}
                    </span>
                    <span className="inline-flex items-center gap-2">
                        <EnvelopeIcon className="h-4 w-4" />
                        {reservation.userId?.email || "Sin email"}
                    </span>
                    </div>
                </div>

                {/* DETALLES */}
                <div className="grid gap-2 text-sm text-text-muted sm:grid-cols-2 md:grid-cols-1">
                    <span className="inline-flex items-center gap-2">
                    <UserGroupIcon className="h-4 w-4" />
                        {reservation.guests} personas
                    </span>
                    <span className="inline-flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4" />
                        {reservation.tableId?.name || "Mesa"}
                    </span>

                    <span>
                        {new Date(reservation.date).toLocaleDateString()}
                    </span>

                    <span>
                        Estado: {reservation.status}
                    </span>
                </div>

                {/* BOTONES */}
                <div className="flex flex-wrap items-center gap-3 md:justify-end">
                    <button className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold">
                    <PencilSquareIcon className="h-4 w-4" />
                        Editar
                    </button>

                    <button className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold text-error">
                    <TrashIcon className="h-4 w-4" />
                        Cancelar
                    </button>
                </div>
                </article>
            ))}
            </div>
        </section>
        </div>
    );
};