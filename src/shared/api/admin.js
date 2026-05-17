import { axiosAdmin } from "./api";

export const getReservationsForAdmin = async () => {
    const { data } = await axiosAdmin.get('/reservations/admin');
    return data;
};

export const cancelReservationRequest = async (id, reason = "") => {
    const { data } = await axiosAdmin.patch(
        `/reservations/${id}/cancel`,
        { reason }
    );

    return data;
};

export const confirmReservationRequest = async (id) => {
    const { data } = await axiosAdmin.patch(
        `/reservations/${id}/confirm`
    );

    return data;
};

/* Para obtener las mesas por restaurante */
export const getRestaurantTables = async (restaurantId) => {
    const { data } = await axiosAdmin.get(`/tables/restaurants/${restaurantId}`)

    return data;
}

export const createReservation = async (reservationData) => {
    console.log(reservationData);
    const { data } = await axiosAdmin.post('/reservations/create', reservationData);

    return data;
}