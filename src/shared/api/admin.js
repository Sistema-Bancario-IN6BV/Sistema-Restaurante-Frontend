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
export const getRestaurantTables = async () => {
    const { data } = await axiosAdmin.get('/tables');

    return data;
};

export const createReservation = async (reservationData) => {
    console.log(reservationData);
    const { data } = await axiosAdmin.post('/reservations/create', reservationData);

    return data;
}

export const updateReservation = async (id, reservationData) => {
    const { data } = await axiosAdmin.put(`/reservations/${id}`, reservationData);

    return data;
};

export const checkReservationAvailability = async (data) => {
    const response = await axiosAdmin.post(
        '/reservations/check-availability',
        data
    );

    return response.data;
};

export const completeReservationRequest = async (id) => {
    const { data } = await axiosAdmin.patch(
        `/reservations/${id}/complete`
    );
    return data;
};