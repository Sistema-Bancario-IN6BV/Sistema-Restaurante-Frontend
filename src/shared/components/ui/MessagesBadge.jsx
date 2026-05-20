import { useEffect, useState, useRef } from "react";
import { getUnreadMessagesCount, getMyMessages, markMessageAsRead } from "../../api/messages";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";

export const MessagesBadge = () => {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const c = await getUnreadMessagesCount();
      if (mounted) setCount(c ?? 0);
    };
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggle = async () => {
    setOpen((v) => !v);
    if (!open) {
      const msgs = await getMyMessages(1, 5);
      setItems(msgs || []);
    }
  };

  const handleMarkRead = async (id) => {
    await markMessageAsRead(id);
    setItems((cur) => cur.map(m => m.id === id ? { ...m, read: true } : m));
    setCount((c) => Math.max(0, c - 1));
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggle} className="relative p-2 rounded-full hover:bg-accent/10">
        <Bell className="w-5 h-5" />
        {count > 0 && <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold rounded-full bg-error text-white">{count}</span>}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-bg-card border rounded-lg shadow-lg z-20">
          <div className="p-3 border-b">
            <div className="font-semibold">Notificaciones</div>
          </div>
          <div className="max-h-60 overflow-auto">
            {items.length === 0 && <div className="p-3 text-sm text-text-muted">No hay notificaciones.</div>}
            {items.map((m) => (
              <div key={m.id} className={`p-3 border-b hover:bg-accent/5 ${m.read ? "opacity-70" : ""}`}>
                <Link to={`/messages/${m.id}`} className="block text-sm font-medium truncate">{m.title || "Sin asunto"}</Link>
                <div className="text-xs text-text-muted mt-1 flex justify-between">
                  <span>{new Date(m.createdAt).toLocaleString()}</span>
                  {!m.read && <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMarkRead(m.id); }} className="text-xs text-accent ml-2">Marcar leído</button>}
                </div>
              </div>
            ))}
          </div>
          <div className="p-2 text-center">
            <Link to="/messages" className="text-sm text-accent font-semibold">Ver todas</Link>
          </div>
        </div>
      )}
    </div>
  );
};
