import { useState } from "react";
import { useOrderStore } from "../store/useOrderStore";

export const CreateOrderModal = ({ isOpen, onClose }) => {
  const { createOrder } = useOrderStore();
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      // minimal placeholder: create empty order or adapt to real form
      await createOrder({ items: [] });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Nuevo Pedido</h3>

        <p className="text-sm text-gray-600 mb-4">Formulario temporal para crear pedidos.</p>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded border">Cerrar</button>
          <button onClick={handleCreate} className="px-4 py-2 rounded bg-accent text-white" disabled={loading}>
            {loading ? "Creando..." : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
};