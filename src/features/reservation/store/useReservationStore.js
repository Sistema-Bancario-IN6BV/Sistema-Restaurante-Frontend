import  { create } from "zustand";
import { 
    getReservationsForAdmin as getReservationsRequest,
    cancelReservationRequest,
    confirmReservationRequest,
} from "../../../shared/api/admin";

export const useReservationStore = create((set, get) => ({
    reservations: [],
    reservation: null,
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
    },

    cancelReservation: async (id) => {
        try {

            const response = await cancelReservationRequest(id);

            set((state) => ({
                reservations: state.reservations.map((r) =>
                    r._id === id
                        ? response.data
                        : r
                )
            }));

        } catch (error) {
            console.log(error);
        }
    },

    confirmReservation: async (id) => {
        try {

            const response = await confirmReservationRequest(id);

            set((state) => ({
                reservations: state.reservations.map((r) =>
                    r._id === id
                        ? response.data
                        : r
                )
            }));

        } catch (error) {
            console.log(error);
        }
    },
}));