import { Routes, Route, Navigate } from "react-router-dom";
import { AuthPage } from "../../features/auth/pages/AuthPage.jsx";
import { RequireAuth } from "./RequireAuth.jsx";

import { Users } from "../../features/users/components/Users.jsx";
import { Restaurants } from "../../features/restaurants/components/Restaurants.jsx";
import { DashboardHome } from "../../features/dashboard/pages/DashboardHome.jsx";
import { UnauthorizedPage } from "../../features/auth/pages/UnauthorizedPage.jsx";
import { VerifyEmailPage } from "../../features/auth/pages/VerifyEmailPage.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { RoleGuard } from "./RoleGuard.jsx";

import { Users } from "../../features/users/components/Users.jsx";
import { Reservations } from "../../features/reservation/components/Reservation.jsx";
import { Ingredients } from "../../features/inventory/components/Ingredients.jsx";
import { Inventory } from "../../features/inventory/components/Inventory.jsx";
import { DashboardPage } from "../Layouts/DashboardPage.jsx";

export const AppRoutes = () => {
    return (
        <Routes>
            {/* RUTAS PUBLICAS */}
            <Route path="/" element={<AuthPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* PROTECTED ROUTES + ROLE */}
            <Route
                path="/dashboard"
                element={
                    <RequireAuth>
                        <DashboardPage />
                    </RequireAuth>
                }
            >
                <Route index element={<DashboardHome />} />
                <Route path="restaurants" element={<Restaurants />} />
                    <ProtectedRoute>
                        <RoleGuard allowedRole={["RESTAURANT_ADMIN", "PLATFORM_ADMIN"]}>
                            <DashboardPage />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            >
                <Route path="users" element={<Users />} />
                <Route path="reservations" element={<Reservations />} />
                <Route path="ingredients" element={<Ingredients />} />
                <Route path="inventory" element={<Inventory />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};