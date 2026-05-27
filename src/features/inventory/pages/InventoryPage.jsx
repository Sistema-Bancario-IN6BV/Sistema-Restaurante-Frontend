import { useEffect, useMemo, useState } from "react";
import { useIngredientStore } from "../../ingredients/store/useIngredientStore";
import { showSuccess, showError } from "../../../shared/utils/toast.js";
import { InventoryModal } from "../components/InventoryModal";

const PAGE_SIZE = 8;
const LOW_STOCK_THRESHOLD = 10;

const getStockStatus = (current, minimum, alert) => {
    if (current === undefined || minimum === undefined) return "normal";
    if (current === 0) return "agotado";
    if (alert || current <= minimum) return "crítico";
    if (current <= LOW_STOCK_THRESHOLD) return "bajo";
    return "normal";
};

const stockBadge = {
    normal: "bg-success/20 text-success border border-success/30",
    bajo: "bg-warning/20 text-warning border border-warning/30",
    crítico: "bg-error/20 text-error border border-error/30",
    agotado: "bg-error/30 text-error border border-error/50 font-black",
};

const stockLabel = { normal: "Normal", bajo: "Stock bajo", crítico: "Crítico", agotado: "Agotado" };

export const InventoryPage = () => {
    const { ingredients, loading, error, getIngredients } = useIngredientStore();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        getIngredients();
    }, [getIngredients]);

    useEffect(() => {
        if (error) showError(error);
    }, [error]);

    const enriched = useMemo(() =>
        ingredients.map((r) => ({
            ...r,
            status: getStockStatus(r.currentStock, r.minStock, r.lowStockAlert),
        })), [ingredients]);

    const alerts = useMemo(() => enriched.filter((r) => r.status !== "normal"), [enriched]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return enriched.filter((r) => {
            const name = r.name?.toLowerCase() || "";
            const supplier = r.supplier?.toLowerCase() || "";
            const matchesSearch = !q || name.includes(q) || supplier.includes(q);
            const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [enriched, search, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paginated = useMemo(() => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filtered, currentPage]);

    return (
        <div className="p-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-accent font-serif">Control de Inventario</h1>
                    <p className="text-accent/80 mt-1 text-sm font-medium">Monitor de stock, costos y niveles de abastecimiento</p>
                </div>
            </div>

            {alerts.length > 0 && (
                <div className="mb-5 space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-error text-lg">⚠️</span>
                        <h2 className="text-sm font-bold text-error uppercase tracking-wider">Alertas de Stock ({alerts.length})</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {alerts.map((r) => (
                            <div key={r._id} className={`flex items-center justify-between rounded-xl border p-3 shadow-sm ${r.status === "agotado" ? "bg-error/10 border-error/40" : r.status === "crítico" ? "bg-error/5 border-error/20" : "bg-warning/5 border-warning/20"}`}>
                                <div>
                                    <p className="font-bold text-text-body text-sm">{r.name}</p>
                                    <p className="text-xs text-text-muted mt-0.5">Stock: <span className="font-semibold">{r.currentStock}</span> {r.unit} · Mín: {r.minStock}</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${stockBadge[r.status]}`}>{stockLabel[r.status]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-bg-card rounded-xl border border-accent/10 shadow-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por ingrediente o proveedor..." className="md:col-span-2 w-full px-4 py-2 border border-accent/20 bg-bg-page rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors" />
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
                                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">Stock</th>
                                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">Mínimo</th>
                                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">Costo/U</th>
                                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">Estado</th>
                                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">Proveedor</th>
                                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">Últ. Abasto</th>
                                <th className="text-right px-6 py-4 font-semibold uppercase tracking-wider text-xs">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-accent/10">
                            {loading && ingredients.length === 0 ? (
                                <tr><td colSpan={8} className="px-6 py-8 text-center text-text-muted">Cargando inventario...</td></tr>
                            ) : paginated.length === 0 ? (
                                <tr><td colSpan={8} className="px-6 py-8 text-center text-text-muted">No hay registros.</td></tr>
                            ) : (
                                paginated.map((r) => (
                                    <tr key={r._id} className={`hover:bg-bg-page/50 transition-colors ${!r.active ? "opacity-50" : ""}`}>
                                        <td className="px-6 py-4 font-semibold text-text-body">
                                            {r.name} <span className="ml-2 text-xs text-text-muted font-mono">({r.unit})</span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-text-body tabular-nums">{r.currentStock}</td>
                                        <td className="px-6 py-4 text-text-muted tabular-nums">{r.minStock}</td>
                                        <td className="px-6 py-4 text-text-muted tabular-nums">Q{r.costPerUnit?.toFixed(2) || "0.00"}</td>
                                        <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${stockBadge[r.status]}`}>{stockLabel[r.status]}</span></td>
                                        <td className="px-6 py-4 text-text-muted text-xs">{r.supplier || "—"}</td>
                                        <td className="px-6 py-4 text-text-muted text-xs">
                                            {r.lastRestockedAt ? new Date(r.lastRestockedAt).toLocaleDateString() : (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—")}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="px-3 py-1.5 rounded-lg bg-bg-page/50 hover:bg-accent/10 border border-accent/20 text-accent text-xs font-semibold transition-colors" onClick={() => { setSelected(r); setModalOpen(true); }}>
                                                Ajustar
                                            </button>
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
                        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-lg border border-accent/20 bg-bg-page hover:bg-accent/10 text-text-body text-sm disabled:opacity-50 transition-colors">Anterior</button>
                        <span className="px-4 py-2 text-sm font-semibold text-text-body">{currentPage} / {totalPages}</span>
                        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg border border-accent/20 bg-bg-page hover:bg-accent/10 text-text-body text-sm disabled:opacity-50 transition-colors">Siguiente</button>
                    </div>
                </div>
            </div>

            <InventoryModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setSelected(null); }} record={selected} ingredients={ingredients} />
        </div>
    );
};