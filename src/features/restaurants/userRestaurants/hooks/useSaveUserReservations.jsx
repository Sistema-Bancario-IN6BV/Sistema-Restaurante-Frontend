import {
    useUserRestaurantStore
} from "../store/useUserRestaurantStore";

export const useSaveUserReservation = () => {

    const createReservation = useUserRestaurantStore((state) => state.createReservation);

    const saveReservation = async (data) => {
        try {

            const reservationData = {
                restaurant: data.restaurant,
                table: data.table,
                reservationDate: data.reservationDate,
                time: data.time,
                guests: Number(data.guests),
                notes: data.notes
            };

            await createReservation(reservationData);

            return {
                success: true
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || "Error al crear reservación"
            };
        }
    };

    return {
        saveReservation
    };
};