import  { create } from "zustand";
import { 
    getReservationsForAdmin as getReservationsRequest,
    cancelReservationRequest,
    confirmReservationRequest,
    getRestaurantTables as getRestaurantTablesRequest,
    createReservation as createReservationRequest,
    updateReservation as updateReservationRequest,
    completeReservationRequest
} from "../../../shared/api/admin";

export const useReservationStore = create((set, get) => ({
    reservations: [],
    tables: [],
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

    getRestaurantTables: async (restaurantId, currentTableId = null) => {
        try {
            const response = await getRestaurantTablesRequest(
                restaurantId,
                currentTableId
            );

            console.log(response);

            set({
                tables: response.tables || []
            });
        } catch (error) {
            console.log(error);
        }
    },

    createReservation: async (data) => {
        try {
            set({
                loading: true,
                error: null
            });
            const response = await createReservationRequest(data);
            
            set((state) => ({
                reservations: [response.data, ...state.reservations],
                loading: false
            }))
        } catch (error) {
            const message = error.response?.data?.message || "Error al crear la reservación";
            set({
                loading: false,
                error: message
            });

            throw error;
        }
    },

    updateReservation: async (id, reservationData) => {
        try {
            set({
                loading: true,
                error: null
            });

            const response = await updateReservationRequest(
                id,
                reservationData
            );

            set((state) => ({
                reservations: state.reservations.map((reservation) =>
                    reservation._id === id
                        ? response.data
                        : reservation
                ),
                loading: false
            }));

            return true;
        } catch (error) {
            console.log(error);
            set({
                loading: false,
                error: error.response?.data?.message || "Error al actualizar reservación"
            });

            return false;
        }
    },

    completeReservation: async (id) => {
        try {
            const response = await completeReservationRequest(id);

            set((state) => ({
                reservations: state.reservations.map((r) =>
                    r._id === id ? response.data : r
                )
            }));
        } catch (error) {
            console.log(error);
        }
    },
}));