import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCartStore } from "../../../features/cart/store/useCartStore";

// Cart badge with mini-preview dropdown connected to zustand store `useCartStore`
export const CartBadge = ({ to = "/customer/orders", checkoutTo = "/customer/checkout" }) => {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);

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

  const count = Array.isArray(items) ? items.length : 0;

  const total = items?.reduce((acc, it) => acc + (it.quantity || 1) * (it.unitPrice || it.price || 0), 0);

  const handleRemove = (id) => {
    removeItem((i) => i.id === id);
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
            {items.length === 0 && <div className="p-3 text-sm text-text-muted">Tu carrito está vacío.</div>}
            {items.map((it) => (
              <div key={it.id} className="p-3 border-b flex items-center justify-between gap-2">
                <div>
                  <div className="font-medium text-sm truncate">{it.name || it.title || `Item ${it.id}`}</div>
                  <div className="text-xs text-text-muted">{(it.quantity || 1)} x Q{it.unitPrice || it.price || 0}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">Q{((it.quantity || 1) * (it.unitPrice || it.price || 0)).toFixed(2)}</div>
                  <button onClick={() => handleRemove(it.id)} className="text-xs text-error mt-1">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-text-muted">Total</div>
              <div className="font-semibold">Q{(total || 0).toFixed(2)}</div>
            </div>
            <div className="flex gap-2">
              <Link to={to} className="flex-1 px-3 py-2 rounded-lg border text-center">Ver carrito</Link>
              <Link to={checkoutTo} className="flex-1 px-3 py-2 rounded-lg bg-accent text-bg-dark text-center">Pagar</Link>
            </div>
            <div className="mt-2 text-center">
              <button onClick={() => clear()} className="text-xs text-error">Vaciar carrito</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartBadge;
