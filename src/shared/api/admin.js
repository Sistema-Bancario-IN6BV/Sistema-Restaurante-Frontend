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