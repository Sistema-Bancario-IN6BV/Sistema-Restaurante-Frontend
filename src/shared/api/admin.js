import { axiosAdmin } from "./api";

export const getReservationsForAdmin = async () => {
    const { data } = await axiosAdmin.get('/reservations/admin');
    return data;
};