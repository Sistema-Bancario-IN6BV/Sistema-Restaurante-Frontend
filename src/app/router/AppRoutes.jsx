import { Routes, Route, Navigate } from "react-router-dom";
import { AuthPage } from "../../features/auth/pages/AuthPage.jsx";
import { RequireAuth } from "./RequireAuth.jsx";
import { Profile } from "../../features/users/pages/Profile.jsx";
 
import { Users } from "../../features/users/components/Users.jsx";
import { Restaurants } from "../../features/restaurants/components/Restaurants.jsx";
import { MenuItems } from "../../features/menuItems/components/MenuItems.jsx";
import { DashboardHome } from "../../features/dashboard/pages/DashboardHome.jsx";
import { UnauthorizedPage } from "../../features/auth/pages/UnauthorizedPage.jsx";
import { VerifyEmailPage } from "../../features/auth/pages/VerifyEmailPage.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { RoleGuard } from "./RoleGuard.jsx";
 
import { Reservations } from "../../features/reservation/components/Reservation.jsx";
import { Ingredients } from "../../features/inventory/components/Ingredients.jsx";
import { Inventory } from "../../features/inventory/components/Inventory.jsx";
import { Events } from "../../features/events/pages/Events.jsx";
import { DashboardPage } from "../Layouts/DashboardPage.jsx";
import { ReportsPage } from "../../features/dashboard/pages/ReportsPage.jsx";
import { HomePage } from "../../features/home/pages/HomePage.jsx";
import { OrdersPage } from "../../features/orders/OrdersPage.jsx";
import { InvoicesPage } from "../../features/invoices/pages/InvoicesPage.jsx";

export const AppRoutes = () => {
    return (
        <Routes>
            {/* RUTAS PUBLICAS */}
            <Route path="/" element={<AuthPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
 
            {/* PROTECTED ROUTES + ROLE */}
            <Route
                path="/perfil"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <RoleGuard allowedRole={["RESTAURANT_ADMIN", "PLATFORM_ADMIN"]}>
                            <DashboardPage />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            >
                <Route index element={<DashboardHome />} />
                <Route path="restaurants" element={<Restaurants />} />
                <Route path="restaurants/:restaurantId/menu-items" element={<MenuItems />} />
                <Route path="menu-items" element={<MenuItems />} />
                <Route path="users" element={<Users />} />
                <Route path="events" element={<Events />} />
                <Route path="reservations" element={<Reservations />} />
                <Route path="ingredients" element={<Ingredients />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="reports" element={<ReportsPage />} />
            </Route>
 
            {/* RUTAS PARA CLIENTES (protegidas por role CUSTOMER) */}
            <Route
                path="/customer"
                element={
                    <ProtectedRoute>
                        <RoleGuard allowedRole={["CUSTOMER"]}>
                            <div />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            >
                <Route index element={<HomePage />} />
                <Route path="home" element={<HomePage />} />
                <Route path="restaurants" element={<Restaurants />} />
                <Route path="menu" element={<MenuItems />} />
                <Route path="reservations" element={<Reservations />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="invoices" element={<InvoicesPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
 