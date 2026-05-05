import api from "../../app/api";

// Crear pedido
export const createOrder = (data) =>
  api.post("/orders/create", data);

// Obtener MIS pedidos
export const getMyOrders = () =>
  api.get("/orders/my");

// Cambiar estado
export const updateOrderStatus = (id, status) =>
  api.patch(`/orders/${id}/status`, { status });

// Obtener factura por pedido
export const getInvoiceByOrder = (orderId) =>
  api.get(`/invoices/order/${orderId}`);