import { axiosAdmin } from "./api";

export const createOrder = (data) =>
  axiosAdmin.post("/orders/create", data);

export const getMyOrders = () =>
  axiosAdmin.get("/orders/my");

export const updateOrderStatus = (
  id,
  status
) =>
  axiosAdmin.patch(
    `/orders/${id}/status`,
    { status }
  );

export const cancelOrder = (id) =>
  axiosAdmin.patch(
    `/orders/${id}/cancel`
  );

export const deleteOrder = (id) =>
  axiosAdmin.delete(`/orders/${id}`);