import { axiosAdmin } from "./api"; // Using axiosAdmin

export const getDashboardStats = async (role, restaurantId, adminId) => {
    return await axiosAdmin.get('/reports/dashboard-data', {
        params: { role, restaurantId, adminId }
    }); 
};

export const getGlobalReportStats = async () => {
    return await axiosAdmin.get('/reports/global');
};

export const exportGlobalReport = async (format) => {
    return await axiosAdmin.get('/reports/global', {
        params: { format },
        responseType: 'blob',
    });
};

// Restaurant-level reports
export const getRestaurantReportStats = async (restaurantId) => {
    if (!restaurantId) throw new Error('restaurantId required');
    return await axiosAdmin.get(`/reports/restaurant/${restaurantId}/stats`);
};

export const exportRestaurantReport = async (restaurantId, format) => {
    if (!restaurantId) throw new Error('restaurantId required');
    return await axiosAdmin.get(`/reports/restaurant/${restaurantId}/stats`, {
        params: { format },
        responseType: 'blob',
    });
};
