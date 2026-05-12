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

    const { reservations, getReservationsForAdmin } = useReservationStore();

    useEffect(() => {
        getReservationsForAdmin();
    }, []);

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

            <button className="bg-accent px-6 py-2 rounded-xl text-bg-dark font-bold hover:bg-gold-light shadow-lg transition flex items-center justify-center gap-2">
                Nueva reserva
            </button>
        </div>

        {/* CONTENEDOR */}
        <div className="bg-bg-card rounded-xl border border-accent/10 shadow-lg overflow-hidden">
            <div className="divide-y divide-accent/10">
                {reservations.map((reservation) => (
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

                        {/* INFORMACION DEL CLIENTE */}
                        <div>
                            <h3 className="text-base md:text-lg font-bold text-text-body">
                                Usuario: {reservation.userId?.name || reservation.userId}
                            </h3>

                            <div className="mt-3 grid gap-2 text-sm text-text-muted sm:grid-cols-2">
                                <span className="inline-flex items-center gap-2">
                                    <PhoneIcon className="h-4 w-4 text-accent" />
                                    {reservation.userId?.phone || "Sin teléfono"}
                                </span>

                                <span className="inline-flex items-center gap-2">
                                    <EnvelopeIcon className="h-4 w-4 text-accent" />
                                    {reservation.userId?.email || "Sin email"}
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
                                {reservation.tableId?.name || "Mesa"}
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
                            <button className="inline-flex items-center gap-2 rounded-lg bg-bg-page/50 hover:bg-accent/10 border border-accent/20 px-4 py-2 text-xs font-semibold text-accent transition-colors">
                                <PencilSquareIcon className="h-4 w-4" />
                                Editar
                            </button>

                            <button className="inline-flex items-center gap-2 rounded-lg border border-error/30 bg-error/5 hover:bg-error/10 px-4 py-2 text-xs font-semibold text-error transition-colors">
                                <TrashIcon className="h-4 w-4" />
                                Cancelar
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    </div>
    );
};