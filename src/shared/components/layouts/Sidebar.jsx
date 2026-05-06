import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../../features/auth/store/authStore";
import {
    ChartBarIcon,
    BuildingStorefrontIcon,
    UsersIcon,
    ChartPieIcon,
    ShoppingBagIcon,
    BookOpenIcon,
    TableCellsIcon,
    CalendarDaysIcon,
    ReceiptPercentIcon,
    InboxStackIcon,
    BeakerIcon,
    HomeIcon,
} from "@heroicons/react/24/outline";

const menuItemsByRole = {
    PLATFORM_ADMIN: [
        { label: "Dashboard", to: "/dashboard", icon: ChartBarIcon },
        { label: "Restaurantes", to: "/dashboard/restaurants", icon: BuildingStorefrontIcon },
        { label: "Usuarios", to: "/dashboard/users", icon: UsersIcon },
        { label: "Reportes", to: "/dashboard/reports", icon: ChartPieIcon },
    ],
    RESTAURANT_ADMIN: [
        { label: "Dashboard", to: "/dashboard", icon: ChartBarIcon },
        { label: "Pedidos", to: "/dashboard/orders", icon: ShoppingBagIcon },
        { label: "Menú", to: "/dashboard/menu", icon: BookOpenIcon },
        { label: "Mesas", to: "/dashboard/tables", icon: TableCellsIcon },
        { label: "Reservas", to: "/dashboard/reservations", icon: CalendarDaysIcon },
        { label: "Facturas", to: "/dashboard/invoices", icon: ReceiptPercentIcon },
        { label: "Inventario", to: "/dashboard/inventory", icon: InboxStackIcon },
        { label: "Ingredientes", to: "/dashboard/ingredients", icon: BeakerIcon },
        { label: "Reportes", to: "/dashboard/reports", icon: ChartPieIcon },
    ],
    CUSTOMER: [
        { label: "Inicio", to: "/home", icon: HomeIcon },
        { label: "Restaurantes", to: "/restaurants", icon: BuildingStorefrontIcon },
        { label: "Mis Reservas", to: "/dashboard/reservations", icon: CalendarDaysIcon },
        { label: "Mis Pedidos", to: "/dashboard/orders", icon: ShoppingBagIcon },
        { label: "Mis Facturas", to: "/dashboard/invoices", icon: ReceiptPercentIcon },
    ],
};

export const Sidebar = () => {
    const location = useLocation();
    const user = useAuthStore((state) => state.user);
    const role = user?.role || "CUSTOMER";

    const menuItems = menuItemsByRole[role] || menuItemsByRole.CUSTOMER;

    return (
        <aside className="group w-20 hover:w-64 transition-all duration-300 ease-in-out bg-bg-card border-r border-accent/10 h-[calc(100vh-5rem)] sticky top-20 py-5 px-3 shadow-[4px_0_24px_rgba(0,0,0,0.4)] z-40 overflow-x-hidden overflow-y-auto">
            <nav>
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const active = location.pathname === item.to;
                        return (
                            <li key={item.to}>
                                <Link
                                    to={item.to}
                                    className={`flex items-center gap-4 p-3 rounded-xl text-sm transition-all duration-300 tracking-wide font-semibold outline-none ${
                                        active
                                            ? "bg-accent/10 text-accent border border-accent/30 shadow-[inset_0_1px_4px_rgba(245,200,66,0.1)]"
                                            : "text-text-muted hover:text-text-body hover:bg-bg-page border border-transparent"
                                    }`}
                                >
                                    <span className="flex items-center justify-center w-6 h-6 shrink-0">
                                        <item.icon className="w-6 h-6" />
                                    </span>
                                    <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        {item.label}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
};
