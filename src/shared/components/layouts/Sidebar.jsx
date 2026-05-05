import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../../features/auth/store/authStore";

const menuItemsByRole = {
    PLATFORM_ADMIN: [
        { label: "Dashboard", to: "/dashboard", icon: "https://api.iconify.design/noto/bar-chart.svg" },
        { label: "Restaurantes", to: "/dashboard/restaurants", icon: "https://api.iconify.design/noto/convenience-store.svg" },
        { label: "Usuarios", to: "/dashboard/users", icon: "https://api.iconify.design/noto/busts-in-silhouette.svg" },
{ label: "Reportes", to: "/dashboard/reports", icon: "https://api.iconify.design/noto/chart-increasing.svg" },
    ],
    RESTAURANT_ADMIN: [
        { label: "Dashboard", to: "/dashboard", icon: "https://api.iconify.design/noto/bar-chart.svg" },
        { label: "Eventos", to: "/dashboard/events", icon: "https://api.iconify.design/noto/party-popper.svg" },
        { label: "Pedidos", to: "/dashboard/orders", icon: "https://api.iconify.design/noto/package.svg" },
        { label: "Menú", to: "/dashboard/menu", icon: "https://api.iconify.design/noto/open-book.svg" },
        { label: "Mesas", to: "/dashboard/tables", icon: "https://api.iconify.design/noto/chair.svg" },
        { label: "Reservas", to: "/dashboard/reservations", icon: "https://api.iconify.design/noto/calendar.svg" },
        { label: "Facturas", to: "/dashboard/invoices", icon: "https://api.iconify.design/noto/receipt.svg" },
        { label: "Inventario", to: "/dashboard/inventory", icon: "https://api.iconify.design/noto/package.svg" },
        { label: "Ingredientes", to: "/dashboard/ingredients", icon: "https://api.iconify.design/noto/leafy-green.svg" },
        { label: "Reportes", to: "/dashboard/reports", icon: "https://api.iconify.design/noto/chart-increasing.svg" },
    ],
    CUSTOMER: [
        { label: "Inicio", to: "/home", icon: "https://api.iconify.design/noto/house.svg" },
        { label: "Restaurantes", to: "/restaurants", icon: "https://api.iconify.design/noto/convenience-store.svg" },
        { label: "Mis Reservas", to: "/dashboard/reservations", icon: "https://api.iconify.design/noto/calendar.svg" },
        { label: "Mis Pedidos", to: "/dashboard/orders", icon: "https://api.iconify.design/noto/package.svg" },
        { label: "Mis Facturas", to: "/dashboard/invoices", icon: "https://api.iconify.design/noto/receipt.svg" },
    ],
};

export const Sidebar = () => {
    const location = useLocation();
    const user = useAuthStore((state) => state.user);
    const role = user?.role || "CUSTOMER";

    const menuItems = menuItemsByRole[role] || menuItemsByRole.CUSTOMER;

    return (
        <aside className="w-64 bg-bg-card border-r border-accent/10 min-h-[calc(100vh-4.5rem)] p-5 shadow-[4px_0_24px_rgba(0,0,0,0.4)] z-40 overflow-y-auto overflow-x-hidden">
            <nav>
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const active = location.pathname === item.to;
                        return (
                            <li key={item.to}>
                                <Link
                                    to={item.to}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 tracking-wide font-semibold outline-none ${
                                        active
                                            ? "bg-accent/10 text-accent border border-accent/30 shadow-[inset_0_1px_4px_rgba(245,200,66,0.1)]"
                                            : "text-text-muted hover:text-text-body hover:bg-bg-page border border-transparent"
                                    }`}
                                >
                                    <span className="flex items-center justify-center w-6 h-6"><img src={item.icon} alt={item.label} className="w-5 h-5" /></span>
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
};
