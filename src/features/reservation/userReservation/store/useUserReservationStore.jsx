import { create } from "zustand";

import {
    getMyReservationsRequest,
    cancelMyReservationRequest
} from "../../../../shared/api/customer";

export const useUserReservationStore = create((set) => ({
    reservations: [],
    loading: false,
    error: null,

    getMyReservations: async () => {
        try {
            set({
                loading: true,
                error: null
            });

            const response =
                await getMyReservationsRequest();

            set({
                reservations: response.data || [],
                loading: false
            });

        } catch (error) {
            console.log(error);

            set({
                loading: false,
                error:
                    error.response?.data?.message ||
                    "Error al obtener reservaciones"
            });
        }
    },

    cancelReservation: async (id) => {
        try {
            const response =
                await cancelMyReservationRequest(id);

            set((state) => ({
                reservations:
                    state.reservations.map((reservation) =>
                        reservation._id === id
                            ? response.data
                            : reservation
                    )
            }));

        } catch (error) {
            console.log(error);
        }
    }
}));