import { useOrderStore } from "../store/useOrderStore";

export const OrderCard = ({ order }) => {

  const { updateStatus } = useOrderStore();

  return (
    <div className="bg-white rounded-xl shadow p-5">

      <h2 className="text-xl font-bold">
        Pedido #{order._id.slice(-5)}
      </h2>

      <p className="text-gray-500">
        Estado: {order.status}
      </p>

      <p className="text-gray-500">
        Tipo: {order.type}
      </p>

      <div className="mt-3">
        {order.items.map((item, i) => (
          <div key={i} className="border-b py-2">
            {item.name} x {item.quantity}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2 flex-wrap">

        <button
          onClick={() => updateStatus(order._id, "PREPARING")}
          className="bg-yellow-500 text-white px-3 py-1 rounded"
        >
          Preparando
        </button>

        <button
          onClick={() => updateStatus(order._id, "READY")}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Listo
        </button>

        <button
          onClick={() => updateStatus(order._id, "DELIVERED")}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          Entregado
        </button>

      </div>
    </div>
  );
};