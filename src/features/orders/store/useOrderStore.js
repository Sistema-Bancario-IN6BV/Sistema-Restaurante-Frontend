import { create } from "zustand"
import * as orderApi from "../orderService"

export const useOrderStore = create((set, get) => ({
    orders: [],
    loading: false,
    error: null,

    fetchOrders: async () => {
        set({ loading: true, error: null })
        try {
            const res = await orderApi.getMyOrders()
            const orders = res?.orders || res || []
            set({ orders, loading: false })
        } catch (err) {
            set({
                error: err.response?.data?.message || "Error al obtener pedidos",
                loading: false
            })
        }
    },

    createOrder: async (data) => {
        set({ loading: true, error: null })
        try {
            const res = await orderApi.createOrder(data)

            set({
                orders: [res.order, ...get().orders],
                loading: false
            })

            return { success: true }
        } catch (err) {
            set({
                error: err.response?.data?.message || "Error al crear pedido",
                loading: false
            })
            return { success: false, error: err.message }
        }
    },

    updateOrderStatus: async (orderId, status) => {
        try {
            const res = await orderApi.updateOrderStatus(orderId, status)

            const updated = get().orders.map(o =>
                o.id === orderId ? { ...o, status } : o
            )

            set({ orders: updated })

            return { success: true }
        } catch (err) {
            return { success: false }
        }
    }
}))