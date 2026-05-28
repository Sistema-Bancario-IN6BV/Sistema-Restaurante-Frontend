import { create } from "zustand";
import { createOrder } from "../../../shared/api/orders";
import { showSuccess, showError } from "../../../shared/utils/toast";

export const useCartStore = create((set, get) => ({
    items: [],
    cart: [],
    restaurantId: null,

    addToCart: (item, quantity = 1) => {
        const qty = Math.max(1, Number(quantity) || 1);
        const cart = get().cart || [];

        const newRestaurantId = item?.restaurantId || item?.restaurant || item?.restaurant?._id || null;

        // if cart has items from another restaurant, reset it
        if (get().restaurantId && newRestaurantId && get().restaurantId !== String(newRestaurantId)) {
            set({ cart: [], restaurantId: String(newRestaurantId) });
        }

        if (!get().restaurantId && newRestaurantId) {
            set({ restaurantId: String(newRestaurantId) });
        }

        const exists = cart.find((i) => String(i._id || i.id || i.menuItemId) === String(item._id || item.id));

        if (exists) {
            set({
                cart: cart.map((i) =>
                    String(i._id || i.id || i.menuItemId) === String(item._id || item.id)
                        ? { ...i, quantity: Math.max(1, (i.quantity || 0) + qty) }
                        : i
                ),
            });
        } else {
            set({ cart: [...cart, { ...item, quantity: qty }] });
        }
    },

    deliveryAddress: '',
    setDeliveryAddress: (addr) => set({ deliveryAddress: addr }),

    removeFromCart: (id) => {
        set({ cart: get().cart.filter((item) => {
            const candidates = [item._id, item.id, item.menuItemId, item.menuItem];
            return !candidates.some((c) => c && String(c) === String(id));
        }) });
    },

    updateQuantity: (id, qty) => {
        set({ cart: get().cart.map(item => {
            const candidates = [item._id, item.id, item.menuItemId, item.menuItem];
            const match = candidates.some(c => c && String(c) === String(id));
            return match ? { ...item, quantity: Math.max(1, Number(qty) || 1) } : item;
        }) });
    },

    clearCart: () => set({ cart: [], restaurantId: null }),

    checkout: async (opts = {}) => {
        try {
            const cart = get().cart || [];
            if (!cart || cart.length === 0) return { success: false, message: 'Carrito vacío' };

            const restaurantId = get().restaurantId || cart[0]?.restaurantId || cart[0]?.restaurant?._id;

            const items = cart.map((it) => ({ menuItemId: it._id, name: it.name, unitPrice: it.unitPrice ?? it.price ?? 0, quantity: it.quantity }));

            const total = items.reduce((s, it) => s + (it.unitPrice || 0) * (it.quantity || 1), 0);

            const deliveryAddr = opts.address || get().deliveryAddress;
            let deliveryAddressPayload = undefined;
            if (deliveryAddr) {
                deliveryAddressPayload = typeof deliveryAddr === 'string' ? { street: deliveryAddr } : deliveryAddr;
            }

            const payload = {
                items,
                type: opts.type || 'DELIVERY',
                deliveryAddress: deliveryAddressPayload,
                total,
                restaurantId,
                paymentMethod: opts.paymentMethod || 'CARD',
            };

            const res = await createOrder(payload);
            const order = res?.data?.data || res?.data || res;
            const orderId = order?._id || order?.id;

            if (!orderId) {
                showError('No se pudo crear el pedido');
                return { success: false };
            }

            showSuccess('Pedido creado. Estado: PENDIENTE.');
            set({ cart: [], restaurantId: null });
            return { success: true, orderId };
        } catch (err) {
            console.error(err);
            const msg = err?.response?.data?.message || err.message || 'Error al procesar pago';
            showError(msg);
            return { success: false, message: msg };
        }
    },
}));