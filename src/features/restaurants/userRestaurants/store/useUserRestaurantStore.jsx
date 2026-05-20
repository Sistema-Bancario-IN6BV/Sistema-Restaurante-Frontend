import { create } from "zustand";

import {
    getRestaurantsRequest,
    getRestaurantTablesRequest,
    createReservationRequest
} from "../../../../shared/api/customer";

export const useUserRestaurantStore = create((set) => ({

    restaurants: [],
    tables: [],
    loading: false,
    error: null,

    // OBTENER RESTAURANTES
    getRestaurants: async () => {

        try {

            set({
                loading: true,
                error: null
            });

            const response =
                await getRestaurantsRequest();

            console.log(response);

            set({
                restaurants:
                    response?.data ||
                    response?.restaurants ||
                    [],
                loading: false
            });

        } catch (error) {

            console.log(error);

            set({
                restaurants: [],
                loading: false,
                error:
                    error.response?.data?.message ||
                    "Error al obtener restaurantes"
            });
        }
    },

    // OBTENER MESAS DEL RESTAURANTE
    getRestaurantTables: async (
        restaurantId
    ) => {

        try {

            const response =
                await getRestaurantTablesRequest(
                    restaurantId
                );

            console.log(response);

            set({
                tables:
                    response?.tables ||
                    response?.data ||
                    []
            });

        } catch (error) {

            console.log(error);

            set({
                tables: [],
                error:
                    error.response?.data?.message ||
                    "Error al obtener mesas"
            });
        }
    },

    // CREAR RESERVACIÓN
    createReservation: async (
        reservationData
    ) => {

        try {

            set({
                loading: true,
                error: null
            });

            const response =
                await createReservationRequest(
                    reservationData
                );

            set({
                loading: false
            });

            return {
                success: true,
                data:
                    response?.data
            };

        } catch (error) {

            console.log(error);

            const message =
                error.response?.data?.message ||
                "Error al crear reservación";

            set({
                loading: false,
                error: message
            });

            return {
                success: false,
                message
            };
        }
    }
}));