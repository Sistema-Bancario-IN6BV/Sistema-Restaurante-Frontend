import { axiosAdmin } from "./api";

export const getTablesByRestaurant = (
  restaurantId
) =>
  axiosAdmin.get(
    `/tables/restaurant/${restaurantId}`
  );