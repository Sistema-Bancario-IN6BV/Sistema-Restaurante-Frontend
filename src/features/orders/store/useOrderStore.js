import { create } from "zustand";

import {
  createOrder as createOrderRequest,
  getMyOrders as getMyOrdersRequest,
  getOrdersByRestaurant as getOrdersByRestaurantRequest,
  updateOrderStatus as updateOrderStatusRequest,
  cancelOrder as cancelOrderRequest,
  deleteOrder as deleteOrderRequest,
  updateOrder as updateOrderRequest,
} from "../../../shared/api/orders";
import * as restaurantsApi from '../../../shared/api/restaurants.js';
import { useAuthStore } from '../../auth/store/authStore';
import { createInvoice as createInvoiceRequest } from "../../../shared/api/invoices";

export const useOrderStore = create((set, get) => ({
  orders: [],
  loading: false,
  error: null,
  _pollerId: null,

  getOrders: async () => {
    try {
      set({ loading: true, error: null });

      const user = useAuthStore.getState().user;

      
      if (user?.role === 'RESTAURANT_ADMIN' || user?.role === 'PLATFORM_ADMIN') {
        try {
          const restRes = await restaurantsApi.getRestaurantsByAdmin(user.id);
          const restaurants = restRes.data || [];

          const fetches = restaurants.map(r => getOrdersByRestaurantRequest(r._id || r.id));
          const results = await Promise.all(fetches.map(p => p.catch((e) => ({ error: e }))));

          const allOrders = results.reduce((acc, res) => {
            if (!res || res.error) return acc;
            const data = res.data?.data || res.data || res;
            return acc.concat(Array.isArray(data) ? data : (data || []));
          }, []);

          set({ orders: allOrders, loading: false });
          return;
        } catch (e) {
          
        }
      }

      const response = await getMyOrdersRequest();

      set({ orders: response.data.data, loading: false });
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
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Error al crear pedido",
      });
      throw error;
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

      
      if (updated?.status === "DELIVERED") {
        try {
          await createInvoiceRequest(updated._id);
        } catch (e) {
          
          console.error("Error creating invoice:", e?.response?.data || e.message);
        }
      }
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Error al actualizar estado",
      });
    }
  },

  
  startRealtime: (intervalMs = 5000) => {
    if (get()._pollerId) return;
    const id = setInterval(async () => {
      try {
        if (typeof document !== 'undefined' && document.hidden) return;

        const user = useAuthStore.getState().user;

        if (user?.role === 'RESTAURANT_ADMIN' || user?.role === 'PLATFORM_ADMIN') {
          const restRes = await restaurantsApi.getRestaurantsByAdmin(user.id);
          const restaurants = restRes.data || [];
          const fetches = restaurants.map(r => getOrdersByRestaurantRequest(r._id || r.id));
          const results = await Promise.all(fetches.map(p => p.catch((e) => ({ error: e }))));
          const allOrders = results.reduce((acc, res) => {
            if (!res || res.error) return acc;
            const data = res.data?.data || res.data || res;
            return acc.concat(Array.isArray(data) ? data : (data || []));
          }, []);
          set({ orders: allOrders });
          return;
        }

        const res = await getMyOrdersRequest();
        set({ orders: res.data.data });
      } catch (e) {
        
      }
    }, intervalMs);
    set({ _pollerId: id });
  },

  stopRealtime: () => {
    const id = get()._pollerId;
    if (id) {
      clearInterval(id);
      set({ _pollerId: null });
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
        error:
          error.response?.data?.message ||
          "Error al cancelar pedido",
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

  updateOrder: async (id, data) => {
    try {
      set({ loading: true, error: null });

      const response = await updateOrderRequest(id, data);

      const updated = response.data.data;

      set({
        orders: get().orders.map((o) => (o._id === id ? updated : o)),
        loading: false,
      });
      return updated;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Error al actualizar pedido",
      });
      throw error;
    }
  },
}));