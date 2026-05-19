import { axiosAdmin } from "./api";

export const getMyReservationsRequest = async () => {
    const { data } = await axiosAdmin.get('/reservations/my');
    return data;
};

export const cancelMyReservationRequest = async (id) => {
    const { data } = await axiosAdmin.patch(
        `/reservations/${id}/cancel`
    );

    return data;
};

export const createReservationRequest = async (reservationData) => {
    const { data } = await axiosAdmin.post("/reservations/create", reservationData);

    return data;
};

export const getRestaurantsRequest = async () => {
    const { data } = await axiosAdmin.get("/restaurants/get");

    return data;
};

export const getRestaurantTablesRequest = async (restaurantId) => {
    const { data } = await axiosAdmin.get(`/restaurants/restaurant/${restaurantId}`);

    return data;
};