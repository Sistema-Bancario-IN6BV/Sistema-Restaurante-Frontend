import { axiosAuth } from "../../shared/api/api.js";

// Crear pedido
export const createOrder = async (data) => {
  const { data: res } = await axiosAuth.post("/orders/create", data);
  return res;
};

// Obtener MIS pedidos
export const getMyOrders = async () => {
  const { data } = await axiosAuth.get("/orders/my");
  return data;
};

// Cambiar estado
export const updateOrderStatus = async (id, status) => {
  const { data } = await axiosAuth.patch(`/orders/${id}/status`, { status });
  return data;
};

// Obtener factura por pedido
export const getInvoiceByOrder = async (orderId) => {
  const { data } = await axiosAuth.get(`/invoices/order/${orderId}`);
  return data;
};