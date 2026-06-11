import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCartStore } from "../../../features/cart/store/useCartStore";

const menuItemImageUrl = (path) => {
  if (!path) return null;
  const raw = String(path).trim();
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const cloudinaryBase = import.meta.env.VITE_CLOUDINARY_BASE_URL || 'https://res.cloudinary.com/db5rnorif/image/upload/';
  return `${cloudinaryBase}${raw.replace(/^\/+/, '')}`;
};

// Cart badge with mini-preview dropdown connected to zustand store `useCartStore`
export const CartBadge = ({ to = "/customer/orders" }) => {
  const cart = useCartStore((s) => s.cart || []);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const checkout = useCartStore((s) => s.checkout);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "cart") {
        try {
          const arr = e.newValue ? JSON.parse(e.newValue) : [];
          useCartStore.setState({ items: Array.isArray(arr) ? arr : [] });
        } catch (err) {
          useCartStore.setState({ items: [] });
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const count = Array.isArray(cart) ? cart.length : 0;

  const total = cart?.reduce((acc, it) => acc + (it.quantity || 1) * (it.unitPrice || it.price || 0), 0);

  const getId = (it) => it._id || it.id || it.menuItemId || it.menuItem;

  const handleRemove = (id) => {
    removeFromCart(id);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className="relative p-2 rounded-full hover:bg-accent/10 transition-colors">
        <ShoppingCart className="w-6 h-6" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold rounded-full bg-accent text-white">{count}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-bg-card border rounded-lg shadow-lg z-30">
          <div className="p-3 border-b">
            <div className="font-semibold">Carrito</div>
          </div>
          <div className="max-h-60 overflow-auto p-2">
            {cart.length === 0 && (
              <div className="p-3 text-sm text-text-muted">
                Tu carrito está vacío.
              </div>
            )}

            {cart.map((it) => {
              const itemId = getId(it) || JSON.stringify(it.name || it);
              const img = menuItemImageUrl(it?.image || it?.photo || it?.imageUrl);
              const unit = it.unitPrice || it.price || 0;
              const qty = Number(it.quantity) || 1;
              return (
              <div key={itemId} className="p-3 border-b flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {img ? <img src={img} alt={it.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No img</div>}
                  </div>
                  <div>
                    <div className="font-medium text-sm truncate" style={{ maxWidth: 180 }}>{it.name || it.title || `Item ${it.id}`}</div>
                    <div className="text-xs text-text-muted">Q{unit.toFixed(2)}</div>
                    <div className="mt-2">
                      <div className="flex items-center border rounded-lg overflow-hidden">
                        <button onClick={() => updateQuantity(itemId, Math.max(1, qty - 1))} className="px-2 py-1">-</button>
                        <div className="px-3 py-1">{qty}</div>
                        <button onClick={() => updateQuantity(itemId, qty + 1)} className="px-2 py-1">+</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">Q{(unit * qty).toFixed(2)}</div>
                  <button onClick={() => handleRemove(itemId)} className="text-xs text-error mt-1">Eliminar</button>
                </div>
              </div>
            );
            })}
          </div>
            <div className="p-3 border-t">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-text-muted">Total</div>
              <div className="font-semibold">Q{(total || 0).toFixed(2)}</div>
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <Link to={to} className="w-full block px-3 py-2 rounded-lg border text-center">Ver carrito</Link>
              </div>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="px-3 py-2 rounded-lg border">
                <option value="CARD">Tarjeta</option>
                <option value="CASH">Efectivo</option>
                <option value="TRANSFER">Transferencia</option>
              </select>
              <button
                onClick={async () => {
                  const res = await checkout({ paymentMethod });
                  if (res?.success) navigate('/customer/orders');
                }}
                className="px-3 py-2 rounded-lg bg-accent text-bg-dark text-center"
              >
                Pagar
              </button>
            </div>
            <div className="mt-2 text-center">
              <button onClick={() => clearCart()} className="text-xs text-error">Vaciar carrito</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartBadge;
