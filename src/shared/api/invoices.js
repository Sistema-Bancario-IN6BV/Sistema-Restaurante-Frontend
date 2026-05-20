import { axiosAdmin } from "./api";

export const createInvoice = (orderId) =>
  axiosAdmin.post("/invoices", { orderId });

export const getMyInvoices = () =>
  axiosAdmin.get("/invoices/my");

export const payInvoice = (id, paymentMethod) =>
  axiosAdmin.patch(`/invoices/${id}/pay`, {
    paymentMethod,
  });