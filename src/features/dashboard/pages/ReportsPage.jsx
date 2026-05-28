import { useEffect, useState } from "react";
import { Typography, Card, CardBody, Spinner } from "@material-tailwind/react";
import { useAuthStore } from "../../auth/store/authStore";
import {
    exportGlobalReport,
    getGlobalReportStats,
    getRestaurantReportStats,
    getDashboardStats,
    exportRestaurantReport,
} from "../../../shared/api/dashboard";

const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
};

export const ReportsPage = () => {
    const { user } = useAuthStore();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadReports = async () => {
            try {
                setLoading(true);
                setError(null);

                if (user?.role === "PLATFORM_ADMIN") {
                    const { data } = await getGlobalReportStats();
                    setStats(data.data);
                    return;
                }

                // RESTAURANT_ADMIN or other admin roles: fetch restaurant-scoped report
                if (user?.role === "RESTAURANT_ADMIN") {
                    const restaurantId = user.restaurantId || user.restaurant;
                    if (!restaurantId) {
                        setError('No se encontró el restaurantId en el usuario');
                        setStats(null);
                        return;
                    }
                    const { data } = await getDashboardStats(user.role, restaurantId, user.id);
                    // backend returns data shaped under data.data similar to global
                    setStats({ ...(data.data || {}), isRestaurantReport: true, restaurantId });
                    return;
                }

                // other roles: do not show reports
                setStats(null);
            } catch (requestError) {
                setError(requestError.response?.data?.message || "No se pudieron cargar los reportes");
            } finally {
                setLoading(false);
            }
        };

        loadReports();
    }, [user?.role]);

    const handleExport = async (format) => {
        try {
            setExporting(format);
            if (user?.role === "PLATFORM_ADMIN") {
                const response = await exportGlobalReport(format);
                const filename = format === "pdf" ? "reporte-global.pdf" : "reporte-global.xlsx";
                downloadBlob(response.data, filename);
                return;
            }

            if (user?.role === "RESTAURANT_ADMIN") {
                const restaurantId = user.restaurantId || user.restaurant;
                if (!restaurantId) throw new Error('restaurantId missing');
                const response = await exportRestaurantReport(restaurantId, format);
                const filename = format === "pdf" ? `reporte-restaurant-${restaurantId}.pdf` : `reporte-restaurant-${restaurantId}.xlsx`;
                downloadBlob(response.data, filename);
                return;
            }

            throw new Error('No autorizado para exportar reportes');
        } catch (requestError) {
            setError(requestError.response?.data?.message || "No se pudo exportar el reporte");
        } finally {
            setExporting(null);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[420px] items-center justify-center flex-col gap-4 p-6">
                <Spinner className="h-10 w-10 text-[var(--color-gold-amber)]" />
                <Typography className="text-[var(--color-text-muted)] animate-pulse">
                    Preparando el reporte global...
                </Typography>
            </div>
        );
    }

    if (!user || !stats) {
        return (
            <div className="p-6">
                <Card className="border border-[var(--color-base-parchment)] shadow-lg bg-[var(--color-bg-card)]">
                    <CardBody className="p-6">
                        <Typography variant="h5" className="text-[var(--color-text-dark)] font-bold mb-2">
                            Reportes
                        </Typography>
                        <Typography className="text-[var(--color-text-muted)]">
                            No hay permisos o datos disponibles para mostrar reportes.
                        </Typography>
                    </CardBody>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <Typography color="red" variant="h5">{error}</Typography>
            </div>
        );
    }

    const topRestaurants = stats?.topRestaurants || [];

    return (
        <div className="p-6 space-y-8 bg-[var(--color-bg-page)] text-[var(--color-text-body)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <Typography variant="h3" className="text-3xl font-extrabold text-[var(--color-gold-amber)] font-serif tracking-tight">
                        {stats.isRestaurantReport ? 'Reportes del Restaurante' : 'Reportes Globales'}
                    </Typography>
                    <Typography className="font-medium text-lg text-[var(--color-text-mid)]">
                        {stats.isRestaurantReport ? 'Resumen de actividad y rendimiento del restaurante' : 'Resumen de actividad y rendimiento de toda la plataforma'}
                    </Typography>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => handleExport("excel")}
                        disabled={exporting !== null}
                        className="rounded-xl border border-[var(--color-base-parchment)] bg-[var(--color-bg-card)] px-4 py-2 text-sm font-semibold text-[var(--color-text-dark)] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--color-gold-light)] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {exporting === "excel" ? "Exportando..." : "Exportar Excel"}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleExport("pdf")}
                        disabled={exporting !== null}
                        className="rounded-xl bg-[var(--color-gold-amber)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {exporting === "pdf" ? "Exportando..." : "Exportar PDF"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <ReportCard title="Restaurantes activos" value={stats?.restaurants || 0} />
                <ReportCard title="Órdenes globales" value={stats?.totalOrders || 0} />
                <ReportCard title="Ingresos globales" value={`Q${Number(stats?.totalRevenue || 0).toFixed(2)}`} />
            </div>

            <Card className="border border-[var(--color-base-parchment)] shadow-xl bg-[var(--color-bg-card)] overflow-hidden">
                <CardBody className="p-0">
                    <div className="border-b border-[var(--color-base-parchment)] bg-gradient-to-r from-[var(--color-base-crema)] to-transparent p-6">
                        <Typography variant="h5" className="font-bold text-[var(--color-text-dark)]">
                            Top restaurantes
                        </Typography>
                        <Typography variant="small" className="text-[var(--color-text-muted)]">
                            Ordenados por calificación y actividad
                        </Typography>
                    </div>

                    <div className="p-4">
                        {topRestaurants.length > 0 ? (
                            <div className="space-y-3">
                                {topRestaurants.map((restaurant, index) => (
                                    <div
                                        key={restaurant._id || restaurant.id || restaurant.name}
                                        className="flex items-center justify-between rounded-xl border border-[var(--color-base-parchment)] bg-white px-4 py-3 shadow-sm"
                                    >
                                        <div>
                                            <Typography className="font-bold text-[var(--color-text-dark)]">
                                                {index + 1}. {restaurant.name}
                                            </Typography>
                                            <Typography variant="small" className="text-[var(--color-text-muted)]">
                                                {restaurant.category || "Sin categoría"}
                                            </Typography>
                                        </div>
                                        <span className="rounded-full bg-[var(--color-gold-mist)] px-3 py-1 text-xs font-bold text-[var(--color-gold-amber)]">
                                            {restaurant.rating?.average?.toFixed?.(1) ?? restaurant.rating?.average ?? 0} / 5
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Typography variant="small" className="p-6 text-center italic text-[var(--color-text-muted)]">
                                No hay datos para mostrar
                            </Typography>
                        )}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

const ReportCard = ({ title, value }) => (
    <Card className="rounded-3xl border border-[var(--color-base-parchment)] shadow-lg bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-base-crema)] overflow-hidden">
        <CardBody className="p-6">
            <Typography variant="small" className="mb-1 font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                {title}
            </Typography>
            <Typography variant="h3" className="font-extrabold text-[var(--color-text-dark)]">
                {value}
            </Typography>
        </CardBody>
    </Card>
);