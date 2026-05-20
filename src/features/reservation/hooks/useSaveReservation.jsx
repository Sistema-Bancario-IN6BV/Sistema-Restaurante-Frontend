import { useReservationStore } from "../store/useReservationStore";

export const useSaveReservation = () => {
    const createReservation = useReservationStore(
        (state) => state.createReservation
    );

    const updateReservation = useReservationStore(
        (state) => state.updateReservation
    );

    const saveReservation = async (data, reservationId = null) => {
        try {
            if (reservationId) {
                const updateData = {
                    tableId: data.tableId,
                    date: data.date,
                    time: data.time,
                    guests: Number(data.guests),
                    notes: data.notes
                };

                await updateReservation(
                    reservationId,
                    updateData
                );
            } else {
                const createData = {
                    restaurant: data.restaurantId,
                    table: data.tableId,
                    reservationDate: data.date,
                    time: data.time,
                    guests: Number(data.guests),
                    notes: data.notes
                };

                await createReservation(createData);
            }
            return { success: true };
        } catch (error) {
            return {
                error:
                    error.response?.data?.message ||
                    "Error al guardar reservación"
            };
        }
    };

    return { saveReservation };
};