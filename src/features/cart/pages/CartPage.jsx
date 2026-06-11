import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";

const menuItemImageUrl = (path) => {
    if (!path) return null;
    const raw = String(path).trim();
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    const cloudinaryBase = import.meta.env.VITE_CLOUDINARY_BASE_URL || 'https://res.cloudinary.com/db5rnorif/image/upload/';
    return `${cloudinaryBase}${raw.replace(/^\/+/, '')}`;
};

export const CartPage = () => {

    const {
        cart,
        removeFromCart,
        clearCart,
        updateQuantity,
        deliveryAddress,
        setDeliveryAddress,
    } = useCartStore();

    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('CARD');
    const navigate = useNavigate();

    const total = useMemo(() => {

        return cart.reduce(
            (acc, item) =>
                acc +
                item.price * item.quantity,
            0
        );

    }, [cart]);

    return (

        <div className="px-6 md:px-10 py-8">

            <div className="mb-8">

                <h1 className="text-4xl font-bold text-gray-800">
                    Carrito
                </h1>

            </div>

            <div className="space-y-4">
                {cart.map((item) => {
                    const img = menuItemImageUrl(item?.image || item?.photo || item?.imageUrl);
                    const stableId = item._id || item.id || item.menuItemId || item.menuItem || JSON.stringify(item.name);
                    return (
                        <div key={stableId} className="bg-white rounded-2xl p-4 shadow flex items-center gap-4">
                            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {img ? (
                                    <img src={img} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">Sin imagen</div>
                                )}
                            </div>

                            <div className="flex-1">
                                <h2 className="font-bold text-lg">{item.name}</h2>
                                <div className="text-sm text-gray-500">Q {(item.price || item.unitPrice || 0).toFixed(2)} c/u</div>
                                <div className="mt-3 flex items-center gap-3">
                                    <div className="flex items-center border rounded-lg">
                                        <button onClick={() => updateQuantity(stableId, (item.quantity || 1) - 1)} className="px-3 py-2">-</button>
                                        <div className="px-4 py-2">{item.quantity}</div>
                                        <button onClick={() => updateQuantity(stableId, (item.quantity || 1) + 1)} className="px-3 py-2">+</button>
                                    </div>
                                    <button onClick={() => removeFromCart(stableId)} className="px-4 py-2 rounded-lg border text-error">Eliminar</button>
                                </div>
                            </div>

                            <div className="w-40 text-right">
                                <div className="text-xl font-bold text-yellow-600">Q {(item.price * (item.quantity || 1)).toFixed(2)}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 bg-white rounded-2xl p-6 shadow">

                <div className="mt-6 bg-white rounded-2xl p-6 shadow flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="text-sm text-gray-500">Total</div>
                        <div className="text-3xl font-bold text-yellow-600">Q {total.toFixed(2)}</div>
                        <div className="text-xs text-gray-400 mt-1">Incluye impuestos si aplica</div>
                    </div>

                                    <div className="w-full md:w-1/2 mt-4 md:mt-0">
                                            <label className="text-sm text-gray-600">Dirección de entrega</label>
                                            <textarea value={deliveryAddress || ''} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Calle, número, zona, referencias" className="w-full mt-2 p-3 border rounded-lg" rows={3} />
                                        </div>

                        <div className="flex gap-4">
                        <button onClick={clearCart} className="px-6 py-3 rounded-xl border">Vaciar carrito</button>
                        <div className="flex items-center gap-3">
                            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="px-3 py-2 rounded-lg border">
                                <option value="CARD">Tarjeta</option>
                                <option value="CASH">Efectivo</option>
                            </select>
                            <div className="flex items-center gap-3">
                                <button onClick={async () => {
                                    if (!deliveryAddress || !String(deliveryAddress).trim()) {
                                        return alert('Por favor ingresa la dirección para la entrega');
                                    }
                                    setLoading(true);
                                    const result = await useCartStore.getState().checkout({ paymentMethod, type: 'DELIVERY', address: String(deliveryAddress).trim() });
                                    setLoading(false);
                                    if (result?.success) navigate('/customer/orders');
                                }} className="px-6 py-3 rounded-xl bg-yellow-500 text-white font-bold">{loading ? 'Procesando...' : 'Pagar'}</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};