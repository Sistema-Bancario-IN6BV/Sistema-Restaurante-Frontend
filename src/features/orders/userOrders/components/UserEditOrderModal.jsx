/*import { useEffect, useState, useMemo } from "react";
import { getTables } from "../../../../shared/api/tables.js";
import { getAllMenuItems } from "../../../../shared/api/menuItems.js";
import { useOrderStore } from "../store/useUserOrderStore.js";
import { useAuthStore } from "../../../auth/store/useAuthStore.js";
import { showError, showSuccess } from "../../../../shared/utils/notifications.js";

export const UserEditOrderModal = ({ isOpen, onClose, order }) => {
  const { updateOrder } = useOrderStore();
  const { user } = useAuthStore();

  const [type, setType] = useState(order?.type || "DINE_IN");
  const [table, setTable] = useState(order?.tableId || "");
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [deliveryStreet, setDeliveryStreet] = useState(order?.deliveryAddress?.street || "");
  const [deliveryCity, setDeliveryCity] = useState(order?.deliveryAddress?.city || "");
  const [deliveryNotes, setDeliveryNotes] = useState(order?.deliveryAddress?.notes || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setType(order?.type || "DINE_IN");
    setTable(order?.tableId || "");
    setDeliveryStreet(order?.deliveryAddress?.street || "");
    setDeliveryCity(order?.deliveryAddress?.city || "");
    setDeliveryNotes(order?.deliveryAddress?.notes || "");
    fetchTables(order?.restaurantId || user?.restaurantId || user?.restaurant);
    // initialize selected items from order
    const initItems = (order?.items || []).map((it) => ({
      _id: it?.menuItemId || it?._id || it?.id,
      name: it?.name || "",
      price: it?.unitPrice || it?.unit_price || it?.price || 0,
      quantity: it?.quantity || 1,
      maxAvailable: it?.maxAvailable ?? Infinity,
    }));
    setSelectedItems(initItems);
    fetchMenu(order?.restaurantId || user?.restaurantId || user?.restaurant);
  }, [isOpen, order]);

  const fetchTables = async (restaurantId) => {
    if (!restaurantId) return setTables([]);
    try {
      const res = await getTables({ restaurantId });
      const data = res?.data || res;
      const list = Array.isArray(data) ? data : data?.tables || data?.data || [];
      setTables(list);
    } catch (e) {
      setTables([]);
    }
  };

  const fetchMenu = async (restaurantId) => {
    if (!restaurantId) return setMenuItems([]);
    try {
      const res = await getAllMenuItems(restaurantId);
      const data = res?.data || res;
      const list = Array.isArray(data) ? data : Object.values(data).flat();
      setMenuItems(list);
    } catch (e) {
      setMenuItems([]);
    }
  };

  const addMenuItem = (item) => {
    if (!item) return;
    if (!item.available) return;
    const existing = selectedItems.find((si) => si._id === (item._id || item.id));
    if (existing) {
      setSelectedItems((s) => s.map((si) => si._id === existing._id ? { ...si, quantity: Math.min((si.quantity||0) + 1, item.maxAvailable ?? Infinity) } : si));
    } else {
      setSelectedItems((s) => [...s, { _id: item._id || item.id, name: item.name, price: item.price || item.unitPrice || 0, quantity: 1, maxAvailable: item.maxAvailable ?? Infinity }]);
    }
  };

  const changeQuantity = (id, qty) => {
    setSelectedItems((s) => s.map((si) => {
      if (si._id !== id) return si;
      const max = si.maxAvailable === undefined ? Infinity : si.maxAvailable;
      const q = Math.max(1, Math.min(qty, max === Infinity ? qty : max));
      return { ...si, quantity: q };
    }));
  };

  const changeSelectedMenuItem = (currentId, newMenuItemId) => {
    const m = menuItems.find(mi => String(mi._id || mi.id) === String(newMenuItemId));
    setSelectedItems((s) => s.map((si) => {
      if (String(si._id) !== String(currentId)) return si;
      const max = m?.maxAvailable ?? si.maxAvailable ?? Infinity;
      const qty = Math.max(1, Math.min(si.quantity || 1, max === Infinity ? (si.quantity || 1) : max));
      return {
        ...si,
        _id: m?._id || m?.id || newMenuItemId,
        name: m?.name || si.name,
        price: m?.price || m?.unitPrice || si.price,
        maxAvailable: max,
        quantity: qty,
      };
    }));
  };

  const removeSelected = (id) => setSelectedItems((s) => s.filter((si) => si._id !== id));

  const computedTotal = useMemo(() => selectedItems.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0), [selectedItems]);

  const handleSave = async () => {
    if (!order) return;
    setLoading(true);
    try {
      const payload = {
        type,
        tableId: type === "DINE_IN" ? table : undefined,
        deliveryAddress: type === "DELIVERY" ? { street: deliveryStreet, city: deliveryCity, notes: deliveryNotes } : undefined,
        items: selectedItems.map((it) => ({ menuItemId: it._id, name: it.name, price: it.price, quantity: it.quantity })),
        total: computedTotal,
      };
      await updateOrder(order._id, payload);
      showSuccess("Pedido actualizado");
      onClose();
    } catch (e) {
      const msg = e?.response?.data?.message || "Error al actualizar pedido";
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start md:items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
        <h3 className="text-lg font-bold mb-4">Editar Pedido</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border rounded px-2 py-1">
              <option value="DINE_IN">Mesa</option>
              <option value="DELIVERY">Domicilio</option>
              <option value="TAKEOUT">Para llevar</option>
            </select>
          </div>

          {type === "DINE_IN" && (
            <div>
              <label className="block text-sm">Mesa</label>
              <select value={table} onChange={(e) => setTable(e.target.value)} className="w-full border rounded px-2 py-1">
                <option value="">Selecciona una mesa</option>
                {tables.map((t) => (
                  <option key={t._id || t.id} value={t._id || t.id}>
                    {t.number ? `Mesa ${t.number}` : t.name || (t._id || t.id)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {type === "DELIVERY" && (
            <div className="md:col-span-2">
              <label className="block text-sm">Dirección de entrega</label>
              <input value={deliveryStreet} onChange={(e) => setDeliveryStreet(e.target.value)} placeholder="Calle y número" className="w-full border rounded px-2 py-1 mb-2" />
              <input value={deliveryCity} onChange={(e) => setDeliveryCity(e.target.value)} placeholder="Ciudad" className="w-full border rounded px-2 py-1 mb-2" />
              <textarea value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} placeholder="Notas (opcional)" className="w-full border rounded px-2 py-1" />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm">Agregar Platos</label>
            <div className="max-h-48 overflow-auto grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {menuItems.map((m) => (
                <div key={m._id || m.id} className="flex items-center justify-between border rounded p-2">
                  <div className="flex-1">
                    <div className="font-semibold">{m.name}</div>
                    <div className="text-xs text-gray-500">{m.type} • GTQ {m.price ?? 0}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={`text-xs px-2 py-1 rounded ${m.available ? 'bg-success/20 text-success border border-success/30' : 'bg-error/20 text-error border border-error/30'}`}>
                      {m.available ? 'Disponible' : 'No disponible'}
                    </div>
                    <button onClick={() => addMenuItem(m)} disabled={!m.available} className={`px-3 py-1 rounded text-white mt-2 ${m.available ? 'bg-accent' : 'bg-gray-400 cursor-not-allowed'}`}>Agregar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm">Platos seleccionados</label>
            <div className="space-y-2 mt-2 max-h-48 overflow-auto">
              {selectedItems.map(si => (
                <div key={si._id} className="flex items-center justify-between border rounded p-2">
                  <div>
                    <div className="font-semibold">{si.name}</div>
                    <div className="text-xs text-gray-500">GTQ {si.price}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" value={si.quantity} min={1} onChange={(e)=>changeQuantity(si._id, Number(e.target.value))} className="w-16 border rounded px-2 py-1" />
                    <div className="flex flex-col items-end">
                      <div className="text-xs text-gray-500">{si.maxAvailable && si.maxAvailable !== Infinity ? `max ${si.maxAvailable}` : ''}</div>
                      <button onClick={()=>removeSelected(si._id)} className="text-sm text-red-500">Eliminar</button>
                    </div>
                  </div>
                </div>
              ))}
              {selectedItems.length === 0 && <div className="text-sm text-gray-500">No hay platos seleccionados.</div>}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded border">Cerrar</button>
          <button onClick={handleSave} disabled={loading} className="px-4 py-2 rounded bg-accent text-white">{loading ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </div>
    </div>
  );
}; */ 
