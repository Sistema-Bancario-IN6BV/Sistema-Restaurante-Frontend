import { useEffect } from "react";
import { useDashboardStore } from "../store/dashboardStore";
import { useAuthStore } from "../../auth/store/authStore";

export const useDashboard = () => {
    const { stats, loading, error, fetchStats } = useDashboardStore();
    const { user } = useAuthStore();

    useEffect(() => {
        if (user) {
            // Pasamos user.id como adminId
            fetchStats(user.role, user.restaurantId || user.restaurant, user.id);
        }
    }, [fetchStats, user]);

    return {
        stats,
        loading,
        error,
        fetchStats
    };
};
