import { axiosAdmin } from "./api";

export const getReservations = async (restaurantId, token) => {
    if (!restaurantId) throw new Error("getReservations: restaurantId required");
    return axiosAdmin.get(
        `/reservations/restaurant/${restaurantId}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
}; 

export const getReservationsForAdmin = (token) => {
    return axiosAdmin.get('/reservations/admin', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
};