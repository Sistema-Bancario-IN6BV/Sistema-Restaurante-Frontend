import { Routes, Route, Navigate } from "react-router-dom";
import { AuthPage } from "../../features/auth/pages/AuthPage.jsx";
import { useAuthStore } from "../../features/auth/store/authStore";

import { Users } from "../../features/users/components/Users.jsx";
import { DashboardHome } from "../../features/dashboard/pages/DashboardHome.jsx";
import { DashboardPage } from "../Layouts/DashboardPage.jsx";

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<AuthPage />} />

            <Route
                path="/dashboard"
                element={<DashboardPage />}
            >
                <Route index element={<DashboardHome />} />
                <Route path="users" element={<Users />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
