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