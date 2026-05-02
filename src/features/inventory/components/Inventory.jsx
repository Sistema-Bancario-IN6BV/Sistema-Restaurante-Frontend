import { useEffect, useMemo, useState } from "react";
import { useInventoryStore, LOW_STOCK_THRESHOLD } from "../store/useInventoryStore.js";
import { useIngredientStore } from "../store/useIngredientStore.js";
import { showSuccess, showError } from "../../../shared/utils/toast.js";
import { InventoryModal } from "./InventoryModal.jsx";

const PAGE_SIZE = 8;

const getStockStatus = (current, minimum) => {
    if (current === undefined || minimum === undefined) return "normal";
    if (current === 0) return "agotado";
    if (current <= minimum) return "crítico";
    if (current <= LOW_STOCK_THRESHOLD) return "bajo";
    return "normal";
};

const stockBadge = {
    normal: "bg-success/20 text-success border border-success/30",
    bajo: "bg-warning/20 text-warning border border-warning/30",
    crítico: "bg-error/20 text-error border border-error/30",
    agotado: "bg-error/30 text-error border border-error/50 font-black",
};

const stockLabel = {
    normal: "Normal",
    bajo: "Stock bajo",
    crítico: "Crítico",
    agotado: "Agotado",
};

export const Inventory = () => {
    const {
        inventory,
        loading,
        error,
        fetchInventory,
        createRecord,
        updateRecord,
        deleteRecord,
    } = useInventoryStore();
    const { ingredients, fetchIngredients } = useIngredientStore();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        fetchInventory();
        fetchIngredients();
    }, [fetchInventory, fetchIngredients]);

    useEffect(() => {
        if (error) showError(error);
    }, [error]);

    const ingredientMap = useMemo(
        () => Object.fromEntries(ingredients.map((i) => [i.id, i])),
        [ingredients]
    );

    const enriched = useMemo(
        () =>
            inventory.map((r) => ({
                ...r,
                ingredient: ingredientMap[r.ingredientId] || null,
                status: getStockStatus(r.currentStock, r.minimumStock),
            })),
        [inventory, ingredientMap]
    );

    const alerts = useMemo(() => enriched.filter((r) => r.status !== "normal"), [enriched]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return enriched.filter((r) => {
            const name = r.ingredient?.name?.toLowerCase() || "";
            const location = r.location?.toLowerCase() || "";
            const matchesSearch = !q || name.includes(q) || location.includes(q);
            const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [enriched, search, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paginated = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, currentPage]);

    const handleOpenCreate = () => { setSelected(null); setModalOpen(true); };
    const handleOpenEdit = (record) => { setSelected(record); setModalOpen(true); };

    const handleSave = async (values) => {
        if (selected) {
            const res = await updateRecord(selected.id, values);
            if (res.success) { showSuccess("Registro actualizado correctamente"); return true; }
            showError(res.error || "No se pudo actualizar el registro");
            return false;
        }
        const res = await createRecord(values);
        if (res.success) { showSuccess("Registro de inventario creado"); return true; }
        showError(res.error || "No se pudo crear el registro");
        return false;
    };

    const handleDelete = async (id) => {
        const res = await deleteRecord(id);
        if (res.success) { showSuccess("Registro eliminado"); setDeleteTarget(null); }
        else showError(res.error || "No se pudo eliminar el registro");
    };

    return (
        <div className="p-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-accent font-serif">Inventario</h1>
                    <p className="text-accent/80 mt-1 text-sm font-medium">Control de stock y niveles de ingredientes</p>
                </div>
                <button className="bg-accent px-6 py-2 rounded-xl text-bg-dark font-bold hover:bg-gold-light shadow-lg transition" onClick={handleOpenCreate}>
                    + Agregar Registro
                </button>
            </div>

            {alerts.length > 0 && (
                <div className="mb-5 space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-error text-lg">⚠️</span>
                        <h2 className="text-sm font-bold text-error uppercase tracking-wider">Alertas de Stock ({alerts.length})</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {alerts.map((r) => (
                            <div key={r.id} className={`flex items-center justify-between rounded-xl border p-3 shadow-sm ${r.status === "agotado" ? "bg-error/10 border-error/40" : r.status === "crítico" ? "bg-error/5 border-error/20" : "bg-warning/5 border-warning/20"}`}>
                                <div>
                                    <p className="font-bold text-text-body text-sm">{r.ingredient?.name || "Ingrediente"}</p>
                                    <p className="text-xs text-text-muted mt-0.5">Stock: <span className="font-semibold">{r.currentStock}</span> {r.ingredient?.unit} · Mínimo: {r.minimumStock}</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${stockBadge[r.status]}`}>{stockLabel[r.status]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-bg-card rounded-xl border border-accent/10 shadow-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por ingrediente o ubicación..." className="md:col-span-2 w-full px-4 py-2 border border-accent/20 bg-bg-page rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors" />
                    <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="w-full px-4 py-2 border border-accent/20 bg-bg-page rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors cursor-pointer">
                        <option value="ALL">Todos los estados</option>
                        <option value="normal">Normal</option>
                        <option value="bajo">Stock bajo</option>
                        <option value="crítico">Crítico</option>
                        <option value="agotado">Agotado</option>
                    </select>
                </div>
            </div>

            <div className="bg-bg-card rounded-xl border border-accent/10 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-bg-page/50 text-text-body border-b border-accent/10">
                            <tr>
                                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">Ingrediente</th>
                                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">Stock Actual</th>
                                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">Mínimo</th>
                                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">Máximo</th>
                                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">Estado</th>
                                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">Ubicación</th>
                                <th className="text-right px-6 py-4 font-semibold uppercase tracking-wider text-xs">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-accent/10">
                            {loading && inventory.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-text-muted"><span className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mr-2 align-middle" />Cargando inventario...</td></tr>
                            ) : paginated.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-text-muted">{search || statusFilter !== "ALL" ? "Sin resultados." : "No hay registros de inventario."}</td></tr>
                            ) : (
                                paginated.map((r) => (
                                    <tr key={r.id} className="hover:bg-bg-page/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-text-body">
                                            {r.ingredient?.name || <span className="text-text-muted italic">Sin nombre</span>}
                                            {r.ingredient?.unit && <span className="ml-2 text-xs text-text-muted font-mono">({r.ingredient.unit})</span>}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-text-body tabular-nums">{r.currentStock ?? "—"}</td>
                                        <td className="px-6 py-4 text-text-muted tabular-nums">{r.minimumStock ?? "—"}</td>
                                        <td className="px-6 py-4 text-text-muted tabular-nums">{r.maximumStock ?? "—"}</td>
                                        <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${stockBadge[r.status]}`}>{stockLabel[r.status]}</span></td>
                                        <td className="px-6 py-4 text-text-muted text-xs">{r.location || "—"}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="px-3 py-1.5 rounded-lg bg-bg-page/50 hover:bg-accent/10 border border-accent/20 text-accent text-xs font-semibold transition-colors" onClick={() => handleOpenEdit(r)}>Editar</button>
                                                <button className="px-3 py-1.5 rounded-lg bg-bg-page/50 hover:bg-error/10 border border-error/20 text-error text-xs font-semibold transition-colors" onClick={() => setDeleteTarget(r)}>Eliminar</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center justify-between px-6 py-4 border-t border-accent/10 bg-bg-page/20">
                    <p className="text-xs text-text-muted">Mostrando {(currentPage - 1) * PAGE_SIZE + (paginated.length ? 1 : 0)} - {(currentPage - 1) * PAGE_SIZE + paginated.length} de {filtered.length}</p>
                    <div className="flex gap-2">
                        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-lg border border-accent/20 bg-bg-page hover:bg-accent/10 text-text-body text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Anterior</button>
                        <span className="px-4 py-2 text-sm font-semibold text-text-body">{currentPage} / {totalPages}</span>
                        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg border border-accent/20 bg-bg-page hover:bg-accent/10 text-text-body text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Siguiente</button>
                    </div>
                </div>
            </div>

            <InventoryModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setSelected(null); }} onSave={handleSave} loading={loading} record={selected} ingredients={ingredients} />

            {deleteTarget && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-3 sm:px-4">
                    <div className="bg-[#fffaf2] rounded-2xl shadow-2xl border border-accent/20 w-full max-w-sm overflow-hidden">
                        <div className="p-5 bg-error text-white"><h2 className="text-xl font-bold font-serif">Eliminar Registro</h2></div>
                        <div className="p-6">
                            <p className="text-text-body text-center mb-6">¿Eliminar el registro de <span className="font-bold text-accent">{deleteTarget.ingredient?.name || "este ingrediente"}</span>?<br /><span className="text-text-muted text-sm">Esta acción no se puede deshacer.</span></p>
                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                                <button onClick={() => setDeleteTarget(null)} className="px-5 py-2 rounded-xl border border-accent/20 bg-bg-page hover:bg-accent/10 text-text-body font-bold transition-colors">Cancelar</button>
                                <button onClick={() => handleDelete(deleteTarget.id)} disabled={loading} className="px-5 py-2 rounded-xl bg-error text-white font-bold hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2">
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