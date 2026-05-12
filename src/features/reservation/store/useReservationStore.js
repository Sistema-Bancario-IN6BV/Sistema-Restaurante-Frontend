import  { create } from "zustand";
import { 
    getReservationsForAdmin as getReservationsRequest,
} from "../../../shared/api/admin";

export const useReservationStore = create((set, get) => ({
    reservations: [],
    loading: false,
    error: null,

    getReservationsForAdmin: async () => {
        try {
            set({
                loading: true,
                error: null
            });
            const response = await getReservationsRequest();
            console.log(response);

            set({
                reservations: response.data || [],
                loading: false
            })

        } catch (error) {
            set({
                error: error.response?.data?.message || "Error al obtener las reservaciones."
            })
        }
    }
}));