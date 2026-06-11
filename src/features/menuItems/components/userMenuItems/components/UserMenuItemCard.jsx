import { useCartStore } from "../../../../cart/store/useCartStore.js";
import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const menuItemImageUrl = (path) => {

    if (!path) return null;

    const raw = String(path).trim();

    if (
        raw.startsWith("http://") ||
        raw.startsWith("https://")
    ) {
        return raw;
    }

    const cloudinaryBase =
        import.meta.env.VITE_CLOUDINARY_BASE_URL ||
        "https://res.cloudinary.com/db5rnorif/image/upload/";

    return `${cloudinaryBase}${raw.replace(/^\/+/, "")}`;
};

export const UserMenuItemCard = ({ item }) => {

    const { addToCart, deliveryAddress, setDeliveryAddress } = useCartStore();
    const [open, setOpen] = useState(false);
    const [qty, setQty] = useState(1);
    const [showAddress, setShowAddress] = useState(false);
    const [localAddress, setLocalAddress] = useState('');

    const imageUrl = menuItemImageUrl(item?.image);

    return (
        <>
            <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100">

                <div className="h-52 bg-gray-100">

                    {imageUrl ? (

                        <img
                            src={imageUrl}
                            alt={item?.name}
                            className="w-full h-full object-cover"
                        />

                    ) : (

                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            Sin imagen
                        </div>
                    )}
                </div>

                <div className="p-5">

                    <h2 className="text-lg font-bold text-gray-800">
                        {item?.name}
                    </h2>

                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                        {item?.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between">

                        <span className="text-xl font-bold text-yellow-600">
                            Q {item?.price}
                        </span>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setOpen(true)}
                                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-gray-100 transition"
                                >
                                    Ver detalles
                                </button>

                                <button
                                    onClick={() => setShowAddress(true)}
                                    className="rounded-xl bg-yellow-500 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-600 transition"
                                >
                                    Agregar al carrito
                                </button>
                            </div>
                    </div>
                </div>
            </div>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="bg-white rounded-xl max-w-2xl w-full overflow-auto">

                        <div className="flex justify-between items-center p-4 border-b">

                            <h3 className="text-lg font-bold">
                                {item?.name}
                            </h3>

                            <button
                                onClick={() => setOpen(false)}
                                className="p-2"
                            >
                                <XMarkIcon className="w-6 h-6 text-gray-600" />
                            </button>

                        </div>

                        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">

                            <div className="md:col-span-1">

                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={item?.name}
                                        className="w-full h-48 object-cover rounded"
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                                        Sin imagen
                                    </div>
                                )}

                            </div>

                            <div className="md:col-span-2">

                                <p className="text-gray-600 mb-4">
                                    {item?.description}
                                </p>

                                <div className="text-xl font-bold text-yellow-600 mb-4">
                                    Q {item?.price}
                                </div>

                                <div className="flex gap-2 items-center">
                                    <div className="flex items-center border rounded-lg overflow-hidden">
                                        <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2">-</button>
                                        <div className="px-4 py-2">{qty}</div>
                                        <button onClick={() => setQty(qty + 1)} className="px-3 py-2">+</button>
                                    </div>

                                    <button
                                        onClick={() => { setShowAddress(true); }}
                                        className="px-4 py-2 bg-yellow-500 text-white rounded"
                                    >
                                        Agregar al carrito
                                    </button>

                                    <button
                                        onClick={() => setOpen(false)}
                                        className="px-4 py-2 border rounded"
                                    >
                                        Cerrar
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>
            )}

            {showAddress && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Opciones de pedido</h3>
                            <button onClick={() => setShowAddress(false)} className="p-2">✕</button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm">Dirección de entrega</label>
                                <textarea value={localAddress} onChange={(e) => setLocalAddress(e.target.value)} placeholder="Calle, número, zona, referencias" className="w-full mt-2 p-2 border rounded" rows={3} />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button onClick={() => setShowAddress(false)} className="px-4 py-2 border rounded">Cancelar</button>
                                <button onClick={() => {
                                    if (!localAddress.trim()) {
                                        return alert('Por favor ingresa la dirección para la entrega');
                                    }
                                    setDeliveryAddress(localAddress.trim());
                                    addToCart(item, qty);
                                    setShowAddress(false);
                                    setOpen(false);
                                    setQty(1);
                                }} className="px-4 py-2 bg-yellow-500 text-white rounded">Agregar al carrito</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserMenuItemCard;