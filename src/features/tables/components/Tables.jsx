import { useEffect, useState } from "react";

import {
    PencilSquareIcon,
    TrashIcon,
    UserGroupIcon,
    MapPinIcon
} from "@heroicons/react/24/outline";

import { TableModal } from "./TableModal";
import { useMemo } from "react";
import { useTableStore } from "../store/useTableStore";

import { Spinner } from "../../../shared/components/layouts/Spinner.jsx";

export const Tables = () => {

    const {
        tables,
        loading,
        getTables,
        deactivateTable,
        changeTableStatus
    } = useTableStore();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [locationFilter, setLocationFilter] = useState("ALL");
    const [capacityFilter, setCapacityFilter] = useState("ALL");

    const PAGE_SIZE = 6;
    const [page, setPage] = useState(1);

    useEffect(() => {
        setPage(1);
    }, [search, statusFilter, locationFilter, capacityFilter]);

    const filteredTables = useMemo(() => {
        return tables.filter((table) => {
            const matchesSearch =
                !search ||
                table.number.toString().includes(search) ||
                table.location.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "ALL"
                    ? true
                    : statusFilter === "AVAILABLE"
                        ? table.status === "AVAILABLE"
                        : table.status === "OCCUPIED";

            const matchesLocation =
                locationFilter === "ALL"
                    ? true
                    : table.location === locationFilter;

            const matchesCapacity =
                capacityFilter === "ALL"
                    ? true
                    : capacityFilter === "SMALL"
                        ? table.capacity <= 3
                        : capacityFilter === "MEDIUM"
                            ? table.capacity >= 4 && table.capacity <=7
                            : capacityFilter === "LARGE"
                                ? table.capacity > 8
                                : true;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesLocation &&
                matchesCapacity
            );
        });
    }, [tables, search, statusFilter, locationFilter, capacityFilter]);
    
    const totalPages = Math.max(1, Math.ceil(filteredTables.length / PAGE_SIZE));

    const currentPage = Math.min(page, totalPages);

    const paginatedTables = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredTables.slice(start, start + PAGE_SIZE);
    }, [filteredTables, currentPage]);

    const [openModal, setOpenModal] = useState(false);

    const [selectedTable, setSelectedTable] = useState(null);

    useEffect(() => {
        getTables();
    }, []);

    if (loading && tables.length === 0) {
        return <Spinner />;
    }

    return (
        <div className="p-4">

            {/* HEADER */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">

                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent/80">
                        Gestión de mesas
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-accent font-serif">
                        Mesas
                    </h1>

                    <p className="text-accent/80 mt-1 text-sm font-medium">
                        Administra las mesas de tu restaurante
                    </p>
                </div>

                <button
                    onClick={() => {
                        setSelectedTable(null);
                        setOpenModal(true);
                    }}
                    className="bg-accent px-6 py-2 rounded-xl text-bg-dark font-bold hover:bg-gold-light shadow-lg transition"
                >
                    Nueva mesa
                </button>
            </div>

            {/* FILTROS OH SI*/}
            <div className="bg-bg-card rounded-xl border border-accent/10 shadow-lg p-4 mb-4">
                <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar mesa o número..."
                        className="px-4 py-2 rounded-lg border border-accent/20 bg-bg-page"
                    />

                    {/* STATUS */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-accent/20 bg-bg-page"
                    >
                        <option value="ALL">Todos los estados</option>
                        <option value="AVAILABLE">Disponibles</option>
                        <option value="OCCUPIED">Ocupadas</option>
                    </select>

                    {/* LOCATION */}
                    <select
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-accent/20 bg-bg-page"
                    >
                        <option value="ALL">Todas las ubicaciones</option>
                        <option value="INTERIOR">Interior</option>
                        <option value="EXTERIOR">Exterior</option>
                        <option value="TERRACE">Terraza</option>
                        <option value="PRIVATE_ROOM">Sala privada</option>
                    </select>

                    {/* CAPACITY */}
                    <select
                        value={capacityFilter}
                        onChange={(e) => setCapacityFilter(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-accent/20 bg-bg-page"
                    >
                        <option value="ALL">Toda capacidad</option>
                        <option value="SMALL" >1 - 3 personas</option>
                        <option value="MEDIUM"> 4 - 7 personas</option>
                        <option value="LARGE"> 9+ personas</option>
                    </select>
                </div>
            </div>

            {/* CONTENEDOR */}
            <div className="bg-bg-card rounded-xl border border-accent/10 shadow-lg overflow-hidden">

                <div className="divide-y divide-accent/10">

                    {paginatedTables.map((table) => (

                        <article
                            key={table._id}
                            className="grid gap-4 px-4 py-5 transition-colors hover:bg-bg-page/40 md:grid-cols-[90px_1fr_auto] md:items-center md:px-6"
                        >

                            {/* NUMERO */}
                            <div className="flex h-20 w-full items-center justify-center rounded-2xl bg-base-dark-roast text-white shadow-md md:w-20 md:flex-col">

                                <span className="text-2xl font-bold">
                                    #{table.number}
                                </span>
                            </div>

                            {/* INFORMACION */}
                            <div>

                                <h3 className="text-base md:text-lg font-bold text-text-body">
                                    Mesa #{table.number}
                                </h3>

                                <div className="mt-3 grid gap-2 text-sm text-text-muted sm:grid-cols-2">

                                    <span className="inline-flex items-center gap-2">
                                        <UserGroupIcon className="h-4 w-4 text-accent" />
                                        {table.capacity} personas
                                    </span>

                                    <span className="inline-flex items-center gap-2">
                                        <MapPinIcon className="h-4 w-4 text-accent" />
                                        {table.location}
                                    </span>
                                </div>

                                {table.description && (
                                    <p className="mt-3 text-sm text-text-muted">
                                        {table.description}
                                    </p>
                                )}

                                <div className="mt-3">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-bg-page text-text-body border border-accent/20">
                                        {table.status}
                                    </span>
                                </div>
                            </div>

                            {/* BOTONES */}
                            <div className="flex flex-wrap items-center gap-3 md:justify-end">

                                <button
                                    onClick={() => {
                                        setSelectedTable(table);
                                        setOpenModal(true);
                                    }}
                                    className="inline-flex items-center gap-2 rounded-lg bg-bg-page/50 hover:bg-accent/10 border border-accent/20 px-4 py-2 text-xs font-semibold text-accent transition-colors"
                                >
                                    <PencilSquareIcon className="h-4 w-4" />
                                    Editar
                                </button>

                                <button
                                    onClick={() =>
                                        changeTableStatus(
                                            table._id,
                                            table.status === "AVAILABLE"
                                                ? "OCCUPIED"
                                                : "AVAILABLE"
                                        )
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 px-4 py-2 text-xs font-semibold text-green-600 transition-colors"
                                >
                                    Cambiar estado
                                </button>

                                <button
                                    onClick={() => deactivateTable(table._id)}
                                    className="inline-flex items-center gap-2 rounded-lg border border-error/30 bg-error/5 hover:bg-error/10 px-4 py-2 text-xs font-semibold text-error transition-colors"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                    Desactivar
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between mt-6 px-2">

            {/* PAGINACION */}
            <p className="text-sm text-text-muted">
                Mostrando {" "}
                {(currentPage - 1) * PAGE_SIZE + (paginatedTables.length ? 1 : 0)}
                {" - "}
                {(currentPage - 1) * PAGE_SIZE + paginatedTables.length}
                {" de "}
                {filteredTables.length}
            </p>

            {/* BOTONES */}
            <div className="flex gap-2">
                <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-accent/20 bg-bg-page text-sm disabled:opacity-50"
                >
                    Anterior
                </button>

                <span className="px-3 py-2 text-sm font-semibold">
                    {currentPage} / {totalPages}
                </span>

                <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-accent/20 bg-bg-page text-sm disabled:opacity-50"
                >
                    Siguiente
                </button>
            </div>
        </div>

            <TableModal
                isOpen={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setSelectedTable(null);
                }}
                table={selectedTable}
            />
        </div>
    );
};