import { useEffect, useMemo, useState } from "react";
import { useIngredientStore } from "../store/useIngredientStore";
import { showSuccess, showError } from "../../../shared/utils/toast.js";
import { IngredientModal } from "../components/IngredientModal";

const PAGE_SIZE = 8;

export const IngredientsPage = () => {
    const { ingredients, loading, error, getIngredients, deleteIngredient } = useIngredientStore();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => { getIngredients(); }, [getIngredients]);
    useEffect(() => { if (error) showError(error); }, [error]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return ingredients;
        return ingredients.filter((i) => i.name?.toLowerCase().includes(q) || i.unit?.toLowerCase().includes(q) || i.supplier?.toLowerCase().includes(q));
    }, [ingredients, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paginated = useMemo(() => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filtered, currentPage]);

    const handleDelete = async (id) => {
        const res = await deleteIngredient(id);
        if (res.success) { 
            showSuccess("Ingrediente eliminado"); 
            setDeleteTarget(null); 
        }
    };

    return (
        <div className="p-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-accent font-serif">Ingredientes</h1>
                    <p className="text-accent/80 mt-1 text-sm font-medium">Gestiona el catálogo de ingredientes del restaurante</p>
                </div>
                <button onClick={() => { setSelected(null); setModalOpen(true); }} className="bg-accent px-6 py-2 rounded-xl text-bg-dark font-bold hover:bg-gold-light shadow-lg transition">
                    + Nuevo Ingrediente
                </button>
            </div>

            {ingredients.filter(i => i.lowStockAlert).length > 0 && (
                <div className="mb-5 bg-error/5 border border-error/20 rounded-xl p-4">
                    <p className="text-sm font-bold text-error mb-2">⚠️ {ingredients.filter(i => i.lowStockAlert).length} ingrediente(s) con stock bajo</p>
                    <div className="flex flex-wrap gap-2">
                        {ingredients.filter(i => i.lowStockAlert).map(i => (
                            <span key={i._id} className="px-3 py-1 bg-error/10 border border-error/30 rounded-full text-xs font-bold text-error">
                                {i.name} — {i.currentStock} {i.unit} (mín: {i.minStock})
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-bg-card rounded-xl border border-accent/10 shadow-lg p-4 mb-4">
                <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por nombre, unidad o proveedor..." className="w-full px-4 py-2 border border-accent/20 bg-bg-page rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors" />
            </div>

            <div className="bg-bg-card rounded-xl border border-accent/10 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-bg-page/50 text-text-body border-b border-accent/10">
                            <tr>
                                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">Nombre</th>
                                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">Unidad</th>
                                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">Stock Actual</th>
                                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">Stock Mín.</th>
                                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">Estado</th>
                                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">Proveedor</th>
                                <th className="text-right px-6 py-4 font-semibold uppercase tracking-wider text-xs">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-accent/10">
                            {loading && ingredients.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-text-muted"><span className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mr-2 align-middle" />Cargando...</td></tr>
                            ) : paginated.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-text-muted">{search ? "Sin resultados." : "No hay ingredientes registrados."}</td></tr>
                            ) : (
                                paginated.map((ing) => (
                                    <tr key={ing._id} className="hover:bg-bg-page/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-text-body">{ing.name}</td>
                                        <td className="px-6 py-4 text-text-muted font-mono text-xs">{ing.unit}</td>
                                        <td className="px-6 py-4 font-bold tabular-nums">{ing.currentStock}</td>
                                        <td className="px-6 py-4 text-text-muted tabular-nums">{ing.minStock}</td>
                                        <td className="px-6 py-4">
                                            {ing.lowStockAlert
                                                ? <span className="px-3 py-1 rounded-full text-xs font-bold bg-error/20 text-error border border-error/30">Stock bajo</span>
                                                : <span className="px-3 py-1 rounded-full text-xs font-bold bg-success/20 text-success border border-success/30">Normal</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-text-muted text-xs">{ing.supplier || "—"}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => { setSelected(ing); setModalOpen(true); }} className="px-3 py-1.5 rounded-lg bg-bg-page/50 hover:bg-accent/10 border border-accent/20 text-accent text-xs font-semibold transition-colors">Editar</button>
                                                <button onClick={() => setDeleteTarget(ing)} className="px-3 py-1.5 rounded-lg bg-bg-page/50 hover:bg-error/10 border border-error/20 text-error text-xs font-semibold transition-colors">Eliminar</button>
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
                    <p className="text-xs text-text-muted">Mostrando {(currentPage - 1) * PAGE_SIZE + (paginated.length ? 1 : 0)} - {(currentPage - 1) * PAGE_SIZE + paginated.length} de {filtered.length}</p>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-lg border border-accent/20 bg-bg-page hover:bg-accent/10 text-text-body text-sm disabled:opacity-50 transition-colors">Anterior</button>
                        <span className="px-4 py-2 text-sm font-semibold text-text-body">{currentPage} / {totalPages}</span>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg border border-accent/20 bg-bg-page hover:bg-accent/10 text-text-body text-sm disabled:opacity-50 transition-colors">Siguiente</button>
                    </div>
                </div>
            </div>

            <IngredientModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setSelected(null); }} ingredient={selected} />

            {deleteTarget && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-3">
                    <div className="bg-[#fffaf2] rounded-2xl shadow-2xl border border-accent/20 w-full max-w-sm overflow-hidden">
                        <div className="p-5 bg-error text-white"><h2 className="text-xl font-bold font-serif">Eliminar Ingrediente</h2></div>
                        <div className="p-6">
                            <p className="text-text-body text-center mb-6">¿Eliminar <span className="font-bold text-accent">{deleteTarget.name}</span>?<br /><span className="text-text-muted text-sm">Esta acción no se puede deshacer.</span></p>
                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                                <button onClick={() => setDeleteTarget(null)} className="px-5 py-2 rounded-xl border border-accent/20 bg-bg-page hover:bg-accent/10 text-text-body font-bold transition-colors">Cancelar</button>
                                <button onClick={() => handleDelete(deleteTarget._id)} disabled={loading} className="px-5 py-2 rounded-xl bg-error text-white font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                                    {loading ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Sí, eliminar"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};