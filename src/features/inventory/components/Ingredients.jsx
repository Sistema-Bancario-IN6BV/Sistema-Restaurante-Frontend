import { useEffect, useMemo, useState } from "react";
import { useIngredientStore } from "../store/useIngredientStore.js";
import { showSuccess, showError } from "../../../shared/utils/toast.js";
import { IngredientModal } from "./IngredientModal.jsx";

const PAGE_SIZE = 8;

const categoryColors = [
    "bg-accent/20 text-accent-deep border border-accent/30",
    "bg-success/20 text-success border border-success/30",
    "bg-warning/20 text-warning border border-warning/30",
    "bg-copper-terracotta/20 text-copper-base border border-copper-terracotta/30",
];

const getCategoryColor = (category) => {
    if (!category) return "bg-bg-page text-text-muted border border-accent/20";
    // Hash simple para color consistente por categoría
    const idx = [...category].reduce((acc, c) => acc + c.charCodeAt(0), 0) % categoryColors.length;
    return categoryColors[idx];
};

export const Ingredients = () => {
    const { ingredients, loading, error, fetchIngredients, createIngredient, updateIngredient, deleteIngredient } =
        useIngredientStore();

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        fetchIngredients();
    }, [fetchIngredients]);

    useEffect(() => {
        if (error) showError(error);
    }, [error]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return ingredients;
        return ingredients.filter(
            (i) =>
                i.name?.toLowerCase().includes(q) ||
                i.category?.toLowerCase().includes(q) ||
                i.unit?.toLowerCase().includes(q)
        );
    }, [ingredients, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paginated = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, currentPage]);

    const handleOpenCreate = () => {
        setSelected(null);
        setModalOpen(true);
    };

    const handleOpenEdit = (ingredient) => {
        setSelected(ingredient);
        setModalOpen(true);
    };

    const handleSave = async (values) => {
        if (selected) {
            const res = await updateIngredient(selected.id, values);
            if (res.success) {
                showSuccess("Ingrediente actualizado correctamente");
                return true;
            }
            showError(res.error || "No se pudo actualizar el ingrediente");
            return false;
        }
        const res = await createIngredient(values);
        if (res.success) {
            showSuccess("Ingrediente creado correctamente");
            return true;
        }
        showError(res.error || "No se pudo crear el ingrediente");
        return false;
    };

    const handleDelete = async (id) => {
        const res = await deleteIngredient(id);
        if (res.success) {
            showSuccess("Ingrediente eliminado");
            setDeleteTarget(null);
        } else {
            showError(res.error || "No se pudo eliminar el ingrediente");
        }
    };

    return (
        <div className="p-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-accent font-serif">Ingredientes</h1>
                    <p className="text-accent/80 mt-1 text-sm font-medium">
                        Gestiona el catálogo de ingredientes del restaurante
                    </p>
                </div>
                <button
                    className="bg-accent px-6 py-2 rounded-xl text-bg-dark font-bold hover:bg-gold-light shadow-lg transition flex items-center gap-2"
                    onClick={handleOpenCreate}
                >
                    + Nuevo Ingrediente
                </button>
            </div>

            {/* Buscador */}
            <div className="bg-bg-card rounded-xl border border-accent/10 shadow-lg p-4 mb-4">
                <input
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Buscar por nombre, categoría o unidad..."
                    className="w-full px-4 py-2 border border-accent/20 bg-bg-page rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                />
            </div>

            {/* Tabla */}
            <div className="bg-bg-card rounded-xl border border-accent/10 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-bg-page/50 text-text-body border-b border-accent/10">
                            <tr>
                                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">Nombre</th>
                                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">Unidad</th>
                                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">Categoría</th>
                                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">Descripción</th>
                                <th className="text-right px-6 py-4 font-semibold uppercase tracking-wider text-xs">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-accent/10">
                            {loading && ingredients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                                        <span className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mr-2 align-middle" />
                                        Cargando ingredientes...
                                    </td>
                                </tr>
                            ) : paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                                        {search ? "Sin resultados para tu búsqueda." : "No hay ingredientes registrados."}
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((ing) => (
                                    <tr key={ing.id} className="hover:bg-bg-page/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-text-body">{ing.name}</td>
                                        <td className="px-6 py-4 text-text-muted font-mono text-xs">{ing.unit}</td>
                                        <td className="px-6 py-4">
                                            {ing.category ? (
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getCategoryColor(ing.category)}`}>
                                                    {ing.category}
                                                </span>
                                            ) : (
                                                <span className="text-text-muted text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-text-muted text-xs max-w-[200px] truncate">
                                            {ing.description || "—"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    className="px-3 py-1.5 rounded-lg bg-bg-page/50 hover:bg-accent/10 border border-accent/20 text-accent text-xs font-semibold transition-colors"
                                                    onClick={() => handleOpenEdit(ing)}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    className="px-3 py-1.5 rounded-lg bg-bg-page/50 hover:bg-error/10 border border-error/20 text-error text-xs font-semibold transition-colors"
                                                    onClick={() => setDeleteTarget(ing)}
                                                >
                                                    Eliminar
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
                <div className="flex items-center justify-between px-6 py-4 border-t border-accent/10 bg-bg-page/20">
                    <p className="text-xs text-text-muted">
                        Mostrando {(currentPage - 1) * PAGE_SIZE + (paginated.length ? 1 : 0)}
                        {" - "}
                        {(currentPage - 1) * PAGE_SIZE + paginated.length} de {filtered.length}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg border border-accent/20 bg-bg-page hover:bg-accent/10 text-text-body text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Anterior
                        </button>
                        <span className="px-4 py-2 text-sm font-semibold text-text-body">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg border border-accent/20 bg-bg-page hover:bg-accent/10 text-text-body text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal crear/editar */}
            <IngredientModal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setSelected(null); }}
                onSave={handleSave}
                loading={loading}
                ingredient={selected}
            />

            {/* Modal de confirmación de eliminación */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-3 sm:px-4">
                    <div className="bg-[#fffaf2] rounded-2xl shadow-2xl border border-accent/20 w-full max-w-sm overflow-hidden">
                        <div className="p-5 bg-error text-white">
                            <h2 className="text-xl font-bold font-serif">Eliminar Ingrediente</h2>
                        </div>
                        <div className="p-6">
                            <p className="text-text-body text-center mb-6">
                                ¿Estás seguro que deseas eliminar{" "}
                                <span className="font-bold text-accent">{deleteTarget.name}</span>?
                                <br />
                                <span className="text-text-muted text-sm">Esta acción no se puede deshacer.</span>
                            </p>
                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    className="px-5 py-2 rounded-xl border border-accent/20 bg-bg-page hover:bg-accent/10 text-text-body font-bold transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteTarget.id)}
                                    disabled={loading}
                                    className="px-5 py-2 rounded-xl bg-error text-white font-bold hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading ? (
                                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : "Sí, eliminar"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};