import { createOrder } from "./orderService";

export default function CreateOrder() {

  const handleCreate = async () => {
    const order = {
      restaurantId: "ID_RESTAURANTE",
      type: "DINE_IN",
      tableId: "ID_MESA",
      items: [
        {
          menuItemId: "ID_MENU",
          quantity: 2
        }
      ]
    };

    await createOrder(order);
    alert("Pedido creado");
  };

  return (
    <div>
      <h1>Crear Pedido</h1>
      <button onClick={handleCreate}>Crear</button>
    </div>
  );
}