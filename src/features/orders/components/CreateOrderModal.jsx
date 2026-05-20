import { useEffect, useMemo, useState } from "react";
import { axiosAdmin } from "../../../shared/api/api.js";
import { getAllMenuItems } from "../../../shared/api/menuItems.js";
import { getTables } from "../../../shared/api/tables.js";
import { useOrderStore } from "../store/useOrderStore";
import { useAuthStore } from "../../auth/store/authStore";
import { showError, showSuccess } from "../../../shared/utils/toast.js";

export const CreateOrderModal = ({ isOpen, onClose }) => {
  const { createOrder } = useOrderStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  
  const [type, setType] = useState("DINE_IN");
  const [table, setTable] = useState("");
  const [tables, setTables] = useState([]);
  const [deliveryStreet, setDeliveryStreet] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    
    setSelectedItems([]);
    setSearch("");
    setType("DINE_IN");
    setTable("");
    
    if (user?.restaurantId || user?.restaurant) {
      const rid = user.restaurantId || user.restaurant;
      setSelectedRestaurant(rid);
      fetchMenu(rid);
      fetchTables(rid);
    } else {
      fetchRestaurants();
    }
  }, [isOpen]);

  const fetchRestaurants = async () => {
    try {
      const { data } = await axiosAdmin.get("/restaurants/get");
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setRestaurants(list);
      if (list.length > 0) setSelectedRestaurant((prev) => prev || list[0]._id || list[0].id);
    } catch (e) {
      console.error("Error fetching restaurants", e);
      
      if (user?.restaurantId || user?.restaurant) {
        setSelectedRestaurant(user.restaurantId || user.restaurant);
      }
    }
  };

  useEffect(() => {
    if (!selectedRestaurant) return;
    fetchMenu(selectedRestaurant);
    fetchTables(selectedRestaurant);
  }, [selectedRestaurant]);

  const fetchMenu = async (restaurantId) => {
    try {
      const res = await getAllMenuItems(restaurantId);
      const data = res.data || res;
      const list = Array.isArray(data) ? data : Object.values(data).flat();
      
      try {
        const ingrRes = await axiosAdmin.get(`/ingredients/restaurant/${restaurantId}`);
        const ingrData = ingrRes?.data || [];
        const ingrMap = new Map();
        ingrData.forEach(i => { if (i._id) ingrMap.set(String(i._id), i); });

        const enriched = list.map(mi => {
          if (!mi.inventoryIngredients || mi.inventoryIngredients.length === 0) return { ...mi, maxAvailable: Infinity };
          const possible = mi.inventoryIngredients.map(inv => {
            const ing = ingrMap.get(String(inv.ingredientId)) || {};
            const current = Number(ing.currentStock || 0);
            const perUnit = Number(inv.quantity || 0) || 0;
            if (perUnit <= 0) return Infinity;
            return Math.floor(current / perUnit);
          });
          const max = Math.min(...possible);
          return { ...mi, maxAvailable: isFinite(max) ? Math.max(0, max) : Infinity };
        });
        setMenuItems(enriched);
      } catch (e) {
        setMenuItems(list);
      }
    } catch (e) {
      console.error("Error fetching menu items", e);
      setMenuItems([]);
    }
  };

  const fetchTables = async (restaurantId) => {
    try {
      const res = await getTables({ restaurantId });
      
      const data = res?.data || res;
      const list = Array.isArray(data) ? data : data?.tables || data?.data || [];
      setTables(list);
    } catch (e) {
      console.error("Error fetching tables", e);
      setTables([]);
    }
  };

  const filteredMenu = useMemo(() => {
    const q = search.trim().toLowerCase();
    return menuItems.filter((m) => {
      const matchQ = !q || (m.name || "").toLowerCase().includes(q) || (m.description || "").toLowerCase().includes(q);
      return matchQ;
    });
  }, [menuItems, search]);

  const addMenuItem = (item) => {
    if (!item.available) return;
    const max = item.maxAvailable === undefined ? Infinity : item.maxAvailable;
    if (max === 0) {
      showError('Stock insuficiente para ' + item.name);
      return;
    }
    const existing = selectedItems.find((si) => si._id === item._id);
    if (existing) {
      setSelectedItems((s) => s.map((si) => si._id === item._id ? { ...si, quantity: Math.min(si.quantity + 1, max) } : si));
    } else {
      setSelectedItems((s) => [...s, { _id: item._id, name: item.name, price: item.price || 0, quantity: 1, maxAvailable: max }]);
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

  const removeSelected = (id) => setSelectedItems((s) => s.filter((si) => si._id !== id));

  const handleCreate = async () => {
    const newErrors = {};
    if (selectedItems.length === 0) newErrors.items = 'Selecciona al menos un plato';
    if (type === 'DINE_IN' && !table) newErrors.table = 'Selecciona una mesa';
    if (type === 'DELIVERY' && !deliveryStreet) newErrors.deliveryStreet = 'La calle es requerida para domicilio';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setLoading(true);
    try {
      const total = selectedItems.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0);
      const payload = {
        items: selectedItems.map((it) => ({ menuItemId: it._id, name: it.name, price: it.price, quantity: it.quantity })),
        type,
        tableId: type === "DINE_IN" ? table : undefined,
        deliveryAddress: type === 'DELIVERY' ? { street: deliveryStreet, city: deliveryCity, notes: deliveryNotes } : undefined,
        total,
        restaurantId: selectedRestaurant,
      };
      const res = await createOrder(payload);
      showSuccess(res?.message || 'Pedido creado');
      
      try { useOrderStore.getState().getOrders(); } catch (e) {}
      onClose();
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.message || 'Error al crear pedido';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start md:items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl">
        <h3 className="text-lg font-bold mb-4">Nuevo Pedido</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              {restaurants.length > 0 ? (
                <select value={selectedRestaurant} onChange={(e)=>setSelectedRestaurant(e.target.value)} className="border rounded px-2 py-1">
                  {restaurants.map(r=> <option key={r._id||r.id} value={r._id||r.id}>{r.name}</option>)}
                </select>
              ) : null}
              <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Buscar plato..." className="border rounded px-2 py-1 flex-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-80 overflow-auto">
              {filteredMenu.map((m)=> (
                <div key={m._id||m.id} className="border rounded p-2 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="font-semibold">{m.name}</div>
                    <div className="text-xs text-gray-500">{m.type} • ${m.price ?? 0} {m.maxAvailable !== undefined && m.maxAvailable !== Infinity ? (<span className="ml-2 text-xs text-gray-400">(Max: {m.maxAvailable})</span>) : null}</div>
                    <div className="text-xs text-gray-400">{m.description}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`text-xs px-2 py-1 rounded ${m.available ? 'bg-success/20 text-success border border-success/30' : 'bg-error/20 text-error border border-error/30'}`}>
                      {m.available ? 'Disponible' : 'No disponible'}
                    </div>
                    <button onClick={()=>addMenuItem(m)} disabled={!m.available} className={`px-3 py-1 rounded text-white ${m.available ? 'bg-accent' : 'bg-gray-400 cursor-not-allowed'}`}>Agregar</button>
                  </div>
                </div>
              ))}
              {filteredMenu.length === 0 && <div className="text-sm text-gray-500">No hay platos.</div>}
            </div>
          </div>

          <div>
            <div className="mb-3">
              <label className="block text-sm">Tipo</label>
              <select value={type} onChange={(e)=>setType(e.target.value)} className="w-full border rounded px-2 py-1">
                <option value="DINE_IN">Mesa</option>
                <option value="DELIVERY">Domicilio</option>
                <option value="TAKEOUT">Para llevar</option>
              </select>
            </div>

            {type === 'DINE_IN' && (
              <div className="mb-3">
                <label className="block text-sm">Número de mesa</label>
                <select value={table} onChange={(e)=>setTable(e.target.value)} className="w-full border rounded px-2 py-1">
                  <option value="">Selecciona una mesa</option>
                  {tables.map(t => (
                    <option key={t._id || t.id} value={t._id || t.id}>Mesa {t.number || t.name || (t._id || t.id)}</option>
                  ))}
                </select>
                {errors.table && <div className="text-sm text-red-500 mt-1">{errors.table}</div>}
              </div>
            )}

            {type === 'DELIVERY' && (
              <div className="mb-3">
                <label className="block text-sm">Dirección de entrega</label>
                <input value={deliveryStreet} onChange={(e)=>setDeliveryStreet(e.target.value)} placeholder="Calle y número" className="w-full border rounded px-2 py-1 mb-2" />
                {errors.deliveryStreet && <div className="text-sm text-red-500 mb-2">{errors.deliveryStreet}</div>}
                <input value={deliveryCity} onChange={(e)=>setDeliveryCity(e.target.value)} placeholder="Ciudad" className="w-full border rounded px-2 py-1 mb-2" />
                <textarea value={deliveryNotes} onChange={(e)=>setDeliveryNotes(e.target.value)} placeholder="Notas (opcional)" className="w-full border rounded px-2 py-1" />
              </div>
            )}

            <div className="mb-3">
              <label className="block text-sm">Platos seleccionados</label>
              <div className="space-y-2 mt-2 max-h-56 overflow-auto">
                {selectedItems.map(si => (
                  <div key={si._id} className="flex items-center justify-between border rounded p-2">
                    <div>
                      <div className="font-semibold">{si.name}</div>
                      <div className="text-xs text-gray-500">${si.price}</div>
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

            <div className="mb-3">
              <div className="font-bold">Total</div>
              <div className="text-xl">${selectedItems.reduce((s,it)=>s + (it.price||0)*(it.quantity||1),0).toFixed(2)}</div>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 rounded border">Cancelar</button>
              <button onClick={handleCreate} disabled={loading} className="px-4 py-2 rounded bg-accent text-white">{loading? 'Creando...' : 'Crear pedido'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};