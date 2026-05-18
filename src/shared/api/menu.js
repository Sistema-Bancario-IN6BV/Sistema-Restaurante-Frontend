import { axiosAdmin } from "./api";

export const getMenuByRestaurant = (
  restaurantId
) =>
  axiosAdmin.get(
    `/menu/restaurant/${restaurantId}`
  );