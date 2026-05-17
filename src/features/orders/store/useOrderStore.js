import { create } from "zustand";

import {
  createOrder as createOrderRequest,
  getMyOrders as getMyOrdersRequest,
  updateOrderStatus as updateOrderStatusRequest,
  cancelOrder as cancelOrderRequest,
  deleteOrder as deleteOrderRequest,
} from "../../../shared/api/orders";

export const useOrderStore = create((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  getOrders: async () => {
    try {
      set({ loading: true, error: null });

      const response = await getMyOrdersRequest();

      set({
        orders: response.data.data,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Error al obtener pedidos",
      });
    }
  },

  createOrder: async (data) => {
    try {
      set({ loading: true, error: null });

      const response = await createOrderRequest(data);

      set({
        orders: [response.data.data, ...get().orders],
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Error al crear pedido",
      });
    }
  },

  updateStatus: async (id, status) => {
    try {
      set({ loading: true, error: null });

      const response = await updateOrderStatusRequest(id, status);

      const updated = response.data.data;

      set({
        orders: get().orders.map((o) =>
          o._id === id ? updated : o
        ),
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Error al actualizar estado",
      });
    }
  },

  cancelOrder: async (id) => {
    try {
      set({ loading: true });

      const response = await cancelOrderRequest(id);

      const updated = response.data.data;

      set({
        orders: get().orders.map((o) =>
          o._id === id ? updated : o
        ),
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Error al cancelar pedido",
      });
    }
  },

  deleteOrder: async (id) => {
    try {
      set({ loading: true });

      await deleteOrderRequest(id);

      set({
        orders: get().orders.filter((o) => o._id !== id),
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Error al eliminar pedido",
      });
    }
  },
}));