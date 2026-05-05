import  { create } from "zustand";
import { 
    getReservations as getReservationsRequest,
    getReservationsForAdmin as getReservationsForAdminRequest 
} from "../../../shared/api/admin";
import { useAuthStore } from "../../auth/store/authStore";

export const useReservationStore = create((set, get) => ({
    reservations: [],
    loading: false,
    error: null,

    getReservations: async (options = { force: false, restaurantId: null }) => {
        const { force, restaurantId: optRestaurantId } = options;
        if (get().loading) return;
        if (!force && get().reservations.length > 0) return;

        set({ loading: true, error: null });
        try {
            const token = useAuthStore.getState().token;
            const restaurantId = optRestaurantId ?? null;

            let res;
            if (restaurantId) {
                res = await getReservationsRequest(restaurantId, token);
            } else {
                res = await getReservationsForAdminRequest(token);
            }

            const data = res?.data?.data ?? res?.data ?? res;
            set({ reservations: Array.isArray(data) ? data : [], loading: false });
            return { success: true, data };
        } catch (err) {
            set({
                error: err.response?.data?.message || err.message || "Error al obtener reservaciones",
                loading: false,
            });
            return { success: false, error: err?.response?.data?.message || err?.message };
        }
    }
}));