import { axiosAdmin } from "./api";
export const getMyInvoices = () =>
  api.get("/invoices/my");

export const payInvoice = (id, paymentMethod) =>
  api.patch(`/invoices/${id}/pay`, {
    paymentMethod,
  });