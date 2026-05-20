import { create } from "zustand";
import { getDashboardStats } from "../../../shared/api"; 
import { getAllUsers } from "../../../shared/api/auth";

export const useDashboardStore = create((set) => ({
    stats: null,
    loading: false,
    error: null,
    
    fetchStats: async (role, restaurantId, adminId) => {
        try {
            set({ loading: true, error: null });
            
            let dashboardData = {};
            
            if (role === "PLATFORM_ADMIN") {
                const [statsRes, usersRes] = await Promise.all([
                    getDashboardStats(role, restaurantId, undefined),
                    getAllUsers()
                ]);
                
                dashboardData = statsRes.data.data;
                // Reemplazamos el valor quemado del backend con la longitud real de usuarios
                dashboardData.totalUsers = usersRes.users?.length || 0;
            } else {
                const { data } = await getDashboardStats(role, restaurantId, adminId);
                dashboardData = data.data;
            }

            set({ stats: dashboardData, loading: false });
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Error al cargar las estadísticas", 
                loading: false 
            });
        }
    }
}));
