import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../../features/auth/store/authStore";
import { AvatarUser } from "../ui/AvatarUser";
import { MessagesBadge } from "../ui/MessagesBadge";
import { CartBadge } from "../ui/CartBadge";
import {
  HomeIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  ReceiptPercentIcon,
  Bars3Icon,
  XMarkIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

  const customerMenu = [
  { label: "Restaurantes", to: "/customer/restaurants", icon: BuildingStorefrontIcon },
  { label: "Mis Reservas", to: "/customer/reservations", icon: CalendarDaysIcon },
  { label: "Mis Pedidos", to: "/customer/orders", icon: ShoppingBagIcon },
  { label: "Eventos", to: "/customer/events", icon: CalendarDaysIcon },
  
];

export const CustomerNavbar = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === "/" || location.pathname.startsWith("/register");
  const [open, setOpen] = useState(false);

  const isCustomer = user?.role === "CUSTOMER" || !user;

  return (
    <header className="w-full bg-bg-page border-b shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/src/assets/img/LogoTipo.png"
              alt="kinalEats logo"
              onError={(e) => { e.target.onerror = null; e.target.style.display = 'none' }}
              className="w-10 h-10 rounded-full object-cover shadow-sm"
            />
            <span className="text-lg font-black tracking-tight text-accent hover:scale-105 transition-transform duration-200 drop-shadow-[0_0_6px_rgba(245,200,66,0.35)]">kinalEats</span>
          </Link>

          {/* Desktop customer nav */}
          {isCustomer && (
            <nav className="hidden md:flex items-center gap-3 ml-4">
              {customerMenu.map((item) => {
                const active = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
                return (
                  <Link
                    key={`${item.to}-${item.label}`}
                    to={item.to}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-transform transform hover:scale-105 active:scale-95 hover:shadow-sm ${
                      active
                        ? "text-accent bg-accent/10 shadow-[inset_0_1px_4px_rgba(245,200,66,0.08)]"
                        : "text-text-body"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!user ? (
            !isAuthPage && (
              <div className="flex items-center gap-2">
                <button onClick={() => navigate("/", { replace: true })} className="px-4 py-2 rounded-md bg-accent text-white font-semibold transform transition-transform duration-200 hover:scale-105 active:scale-95 shadow-sm">Iniciar sesión</button>
                <Link to="/register" replace className="px-4 py-2 rounded-md border font-semibold transform transition-transform duration-200 hover:scale-105 active:scale-95">Registrarse</Link>
              </div>
            )
          ) : (
            <>
              <div className="hidden sm:flex items-center">
                <CartBadge />
              </div>
              <AvatarUser />
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-bg-card"
            onClick={() => setOpen((s) => !s)}
            aria-label="menu"
          >
            {open ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-bg-page border-t">
          <div className="max-w-6xl mx-auto p-4 space-y-2">
            {customerMenu.map((item) => {
              const active = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    active ? "text-accent bg-accent/10" : "hover:bg-bg-card"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
