import { Routes, Route, Navigate } from "react-router-dom";
import { AuthPage } from "../../features/auth/pages/AuthPage.jsx";
import { RequireAuth } from "./RequireAuth.jsx";

import { Users } from "../../features/users/components/Users.jsx";
import { Restaurants } from "../../features/restaurants/components/Restaurants.jsx";
import { DashboardHome } from "../../features/dashboard/pages/DashboardHome.jsx";
import { DashboardPage } from "../Layouts/DashboardPage.jsx";

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<AuthPage />} />

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
                <Route path="users" element={<Users />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
