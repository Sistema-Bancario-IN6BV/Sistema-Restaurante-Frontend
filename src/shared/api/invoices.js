import { axiosAdmin } from "./api";
import { useAuthStore } from "../../features/auth/store/authStore";

export const createInvoice = (orderId) =>
  axiosAdmin.post("/invoices", { orderId });

export const getMyInvoices = () =>
  axiosAdmin.get("/invoices/my");

export const getInvoiceByOrder = (orderId) =>
  axiosAdmin.get(`/invoices/order/${orderId}`);

export const deleteInvoice = (id) => {
  const token = useAuthStore.getState().token;
  return axiosAdmin.delete(`/invoices/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

export const payInvoice = (id, paymentMethod) =>
  axiosAdmin.patch(`/invoices/${id}/pay`, {
    paymentMethod,
  });